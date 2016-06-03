/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */

import nock from 'nock'

describe(testContext(__filename), function () {
  describe('invoke', function () {
    before(function () {
      this.invoke = require('../vote').invoke
      this.notify = msg => {
        this.notifications.push(msg)
      }
      this.lgJWT = 'not.a.real.token'
      this.lgPlayer = {id: 'not.a.real.id'}
    })
    beforeEach(function () {
      this.notifications = []
    })

    it('notifies with the usage message when requested', function () {
      const {lgJWT, lgPlayer} = this
      this.invoke(['-h'], this.notify, {lgJWT, lgPlayer})
      expect(this.notifications[0]).to.match(/Usage:/)
    })

    it('notifies with an error message when too few goal descriptors are provided', function () {
      const {lgJWT, lgPlayer} = this
      this.invoke(['1'], this.notify, {lgJWT, lgPlayer})
      expect(this.notifications[0]).to.match(/exactly 2/)
    })

    it('notifies with an error message when invoked by a non-player', function () {
      const {lgJWT} = this
      this.invoke(['1', '2'], this.notify, {lgJWT, lgPlayer: null})
      expect(this.notifications[0]).to.match(/not a player/)
      this.invoke(['1', '2'], this.notify, {lgJWT, lgPlayer: {object: 'without id attribute'}})
      expect(this.notifications[1]).to.match(/not a player/)
    })

    it('notifies with a warning if extra goal descriptors are provided', function () {
      nock('https://game.learnersguild.test')
        .post('/graphql')
        .reply(200, {data: {id: '00000000-1111-2222-3333-444444444444'}})

      const {lgJWT, lgPlayer} = this
      this.invoke(['1', '2', '3'], this.notify, {lgJWT, lgPlayer})
      expect(this.notifications[0]).to.match(/disqualified/)
    })

    it('notifies that the goals are being validated', function () {
      nock('https://game.learnersguild.test')
        .post('/graphql')
        .reply(200, {data: {id: '00000000-1111-2222-3333-444444444444'}})

      const {lgJWT, lgPlayer} = this
      this.invoke(['1', '2'], this.notify, {lgJWT, lgPlayer})
      expect(this.notifications[0]).to.match(/Validating/)
    })

    it('notifies that the goals are being validated', function () {
      nock('https://game.learnersguild.test')
        .post('/graphql')
        .reply(200, {data: {id: '00000000-1111-2222-3333-444444444444'}})

      const {lgJWT, lgPlayer} = this
      this.invoke(['1', '2'], this.notify, {lgJWT, lgPlayer})
      expect(this.notifications[0]).to.match(/Validating/)
    })

    it('does not notify if the API invocation succeeds', function (done) {
      nock('https://game.learnersguild.test')
        .post('/graphql')
        .reply(200, {data: {id: '00000000-1111-2222-3333-444444444444'}})

      const {lgJWT, lgPlayer} = this
      return this.invoke(['1', '2'], this.notify, {lgJWT, lgPlayer})
        .then(() => {
          expect(this.notifications.length).to.equal(1)
          done()
        })
        .catch(error => done(error))
    })

    it('notifies of API invocation errors', function (done) {
      nock('https://game.learnersguild.test')
        .post('/graphql')
        .reply(500, 'Internal Server Error')

      const {lgJWT, lgPlayer} = this
      return this.invoke(['1', '2'], this.notify, {lgJWT, lgPlayer})
        .then(() => {
          expect(this.notifications[1]).to.match(/API invocation failed/)
          done()
        })
        .catch(error => done(error))
    })
  })
})
