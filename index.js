'use strict';

const lo_take = require('lodash.take');
const got = require('got');
const fs = require('fs');
const path = require('path');

function fetchWords(query) {
  const query_enc = encodeURIComponent(query);
  const url = `http://ac.endic.naver.com/ac?q=${query_enc}&q_enc=utf-8&st=11001&r_format=json&r_enc=utf-8&r_lt=10001&r_unicode=0&r_escape=1`;
  return got(url).then((res) => {
    const dict = JSON.parse(res.body);
    const items = dict.items;
    const words = lo_take(items[0], 5);
    return words;
  });
}

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
    fetchWords(query_lower).then((words) => {
      const results = words.map((x) => {
        return {
          id: x[0][0],
          title: x[0][0],
          desc: x[1][0],
          redirect: `?${x[0][0]}`,
          preview: true
        };
      });
      res.add(results);
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
      const filteredBody = body.replace('<span class="fnt_k28"></span>', '');
      render(html.replace('%body%', filteredBody));
    });
  }

  return { startup, search, execute, renderPreview };
};
