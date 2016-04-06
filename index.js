'use strict';

const got = require('got');
const fs = require('fs');
const path = require('path');

function fetchDictionary(word) {
  const query = encodeURIComponent(word);
  const url = `http://endic.naver.com/searchAssistDict.nhn?query=${query}`;
  return got(url).then(res => res.body);
}

module.exports = (context) => {
  const app = context.app;
  const shell = context.shell;
  let html = '';

  function startup() {
    html = fs.readFileSync(path.join(__dirname, 'html-wrapper.html'), 'utf8');
  }

  function search(query, res) {
    if (query.length <= 0) {
      res.add({
        title: 'Please enter something',
        desc: 'hain-plugin-naverdictionary'
      });
      return;
    }
    const query_lower = query.toLowerCase();
    res.add({
      id: query_lower,
      title: query,
      desc: 'from Naver.com',
      preview: true
    });
  }

  function execute(id, payload) {
    if (id === undefined)
      return;
    const query = encodeURIComponent(id);
    const url = `http://endic.naver.com/search.nhn?sLn=en&searchOption=all&query=${query}`;
    shell.openExternal(url);
    app.close();
  }

  function renderPreview(id, payload, render) {
    fetchDictionary(id).then((body) => {
      render(html.replace('%body%', body));
    });
  }

  return { startup, search, execute, renderPreview };
};
