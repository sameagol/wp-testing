describe('Multiple answers test', function() {

    var server = require('../env').server()
    var isOpened = null

    before(function () {
        require('../login-as').admin(this)
    })

    afterEach(function() {
        if (false === isOpened) {
            throw new Error('Page not opened so other checks is not actual now')
        }
    })

    it('should be created', function() {
        casper.then(function() {
            this.clickLabel('Add New', '*[@id="menu-posts-wpt_test"]/*//a')
        })

        casper.then(function() {
            'Fatal'.should.not.be.textInDOM
            'Add New Test'.should.be.inTitle

            this.click('#wpt_question_add');
            this.click('#wpt_question_add');
            this.fillSelectors('form#post', {
                '#title': 'Multiple Answers',
                '#wpt_question_title_0': 'Question 1?',
                '#wpt_question_title_1': 'Question 2?'
            })
            this.click('.misc-pub-wpt-test-page-reset-answers-on-back input[type=checkbox]')
            this.click('.misc-pub-wpt-test-page-multiple-answers input[type=checkbox]')
            this.clickLabel(' Yes', 'label')
            this.clickLabel(' No',  'label')
            this.clickLabel(' Extraversion/Introversion', 'label')
            this.click('#publish')
        })

        casper.waitWhileSelector('form#post.wpt-ajax-save').waitForUrl(/message/, function() {
            'Fatal'.should.not.be.textInDOM
            '#message'.should.be.inDOM

            this.fillSelectors('form#post', {
                '#wpt_score_value_0_0': '1',
                '#wpt_score_value_0_1': '2',
                '#wpt_score_value_1_0': '3',
                '#wpt_score_value_1_1': '4'
            })

            this.click('#publish')
        })

        casper.waitWhileSelector('form#post.wpt-ajax-save').waitForUrl(/message/, function() {
            'Fatal'.should.not.be.textInDOM
            '#message'.should.be.inDOM
            '∑ 10'.should.be.textInDom
        })
    })

    it('should be opened', function() {
        isOpened = false
        casper.open(server + '/?wpt_test=multiple-answers').waitForUrl(/multiple-answers/, function() {
            'Multiple Answers'.should.be.textInDOM
        }).then(function() {
            isOpened = true
        })
    })

    it('should have title without percents', function() {
        casper.then(function() {
            'Fatal'.should.not.be.textInDOM
            this.getTitle().should.match(/^Multi/)
        })
    })

    it('should not have percentage in title initially', function() {
        casper.then(function() {
            this.getTitle().should.not.match(/^\d+% ans/)
        })
    })

    it('should have percentage in title after 1st question click', function() {
        casper.then(function() {
            this.clickLabel('No')
            this.getTitle().should.match(/^50% ans/)
        })
    })

    it('should have same percentage after 1st question click on 2nd answer', function() {
        casper.then(function() {
            this.clickLabel('Yes')
            this.getTitle().should.match(/^50% ans/)
        })
    })

    it('should have zero percentage after 1st question answers unclicks', function() {
        casper.then(function() {
            this.clickLabel('Yes')
            this.clickLabel('No')
            this.getTitle().should.match(/^0% ans/)
        })
    })

    function clickAllAnswers() {
        this.clickLabel('Yes', '*[starts-with(@id, "wpt-test-form")]/*[1]/*//label')
        this.clickLabel('No',  '*[starts-with(@id, "wpt-test-form")]/*[1]/*//label')
        this.clickLabel('Yes', '*[starts-with(@id, "wpt-test-form")]/*[2]/*//label')
        this.clickLabel('No',  '*[starts-with(@id, "wpt-test-form")]/*[2]/*//label')
    }
    it('should have all percentage after all answers clicks', function() {
        casper.then(function() {
            clickAllAnswers.call(this)
            this.getTitle().should.match(/^100% ans/)
        })
    })

    it('should have zero percentage after all answers unclicks', function() {
        casper.then(function() {
            clickAllAnswers.call(this)
            this.getTitle().should.match(/^0% ans/)
        })
    })

    it('should open result page', function() {
        isOpened = false
        casper.then(function() {
            clickAllAnswers.call(this)
            this.fill('form.wpt_test_form', {}, true)
        }).waitForUrl(/test.+[a-z0-9]+[a-f0-9]{32}/, function() {
            'Fatal'.should.not.be.textInDOM
            'Results'.should.be.textInDOM
            isOpened = true
        })
    })

    it('should have scale with all answers sum', function() {
        casper.then(function() {
            '10 out of 10'.should.be.textInDOM
        })
    })

    it('should reset answers on back', function() {
        casper.back().then(function() {
            'Results'.should.not.be.textInDOM
            this.getTitle().should.match(/^Multi/)
        })
    })
})
