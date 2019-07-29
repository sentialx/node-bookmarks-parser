const should = require('should');
const parse = require('../build');
const { readFileSync } = require('fs');

describe('Parse bookmarks', () => {
  it('Chrome bookmarks file', done => {
    const html = readFileSync(`${__dirname}/files/chrome.html`, 'utf-8');
    const expected = JSON.parse(
      readFileSync(`${__dirname}/files/chrome.json`, 'utf-8'),
    );

    let result;

    try {
      result = parse(html);
    } catch (err) {
      should.not.exists(err);
    }

    JSON.stringify(result).should.equal(JSON.stringify(expected));
    done();
  });
});
