<?php

class TestTest extends PHPUnit_Framework_TestCase
{

    /**
     * @var fDatabase
     */
    private $db;

    protected function setUp()
    {
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $this->db = fORMDatabase::retrieve('WpTesting_Model_Test', 'write');
        $this->db->translatedExecute('BEGIN');
    }

    protected function tearDown()
    {
        $this->db->translatedExecute('ROLLBACK');
    }

    public function testTestCanBeCreatedAndStored()
    {
        $test = $this->createTest()->store();
        $this->greaterThan($test->getId());
    }

    public function testAddQuestion()
    {
        $test = $this->createTest()->store();
        $test->addQuestion('Question 1');
        $test->addQuestion('Question 2');
        $test->store(true);

        $test2 = new WpTesting_Model_Test($test->getId());
        $this->assertCount(2, $test2->buildQuestions());
    }

    public function testMinimalScaleScore()
    {
        $test   = $this->createTest()->store();
        $scale  = WpTesting_Query_Scale::create()->findByName('Lie');
        $answer = WpTesting_Query_GlobalAnswer::create()->findByName('Yes');
        $test
            ->associateScale($scale)->associateGlobalAnswer($answer)
            ->addQuestion('Question 1')->addQuestion('Question 2')
            ->store(true)->syncQuestionsAnswers()
        ;

        foreach ($test->buildQuestions() as $question) { /* @var $question WpTesting_Model_Question */
            foreach ($question->buildAnswers() as $answer) { /* @var $answer WpTesting_Model_Answer */
                $answer->getScoreByScale($scale)->setValue(-1);
            }
        }
        $test->store(true);

        $scalesWithRange = $test->buildScalesWithRange();
        $this->assertNotEmpty($scalesWithRange);
        /* @var $scaleWithRange WpTesting_Model_Scale */
        $scaleWithRange = $scalesWithRange[0];

        $this->assertEquals(0, $scaleWithRange->getMaximum());
        $this->assertEquals(2, $scaleWithRange->getLength());
        $scaleWithRange->setValue(-2);
    }

    private function createTest()
    {
        $test = new WpTesting_Model_Test();
        return $test
            ->setWp($this->getWpFacade())
            ->setTitle('Test ' . date(DateTime::ATOM))
            ->setContent('Content')
            ->setExcerpt('Excerpt')
            ->setContentFiltered('Content')
            ->setToPing('http://localhost/')
            ->setPinged('http://localhost/')
            ->setType('wpt_test')
            ->setName('test-' . time());
    }

    /**
     * @return WpTesting_WordPressFacade
     */
    private function getWpFacade()
    {
        return $GLOBALS['wp_facade_mock'];
    }
}