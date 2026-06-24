const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

class Element {
  constructor(tagName, text = "") {
    this.tagName = tagName;
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.disabled = false;
    this.checked = false;
    this.type = "";
    this.value = "";
    this.placeholder = "";
    this.className = "";
    this._text = text;
  }

  set textContent(value) {
    this._text = String(value);
    this.children = [];
  }

  get textContent() {
    return [this._text, ...this.children.map((child) => child.textContent)].join("");
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  replaceChildren(...nodes) {
    this.children = [...nodes];
    this._text = "";
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  click() {
    if (!this.disabled && this.listeners.click) {
      this.listeners.click({ target: this });
    }
  }

  dispatch(type) {
    if (this.listeners[type]) {
      this.listeners[type]({ target: this });
    }
  }
}

const ids = [
  "destinations",
  "destinationDetail",
  "summaryStatus",
  "sections",
  "packageList",
  "issues",
  "combinedPreview",
  "addToPackage",
  "packageNote",
  "resetSample",
];

const elements = Object.fromEntries(ids.map((id) => [id, new Element("div")]));
elements.addToPackage.tagName = "button";
elements.resetSample.tagName = "button";

const document = {
  querySelector(selector) {
    const id = selector.replace("#", "");
    assert(elements[id], `Unexpected selector: ${selector}`);
    return elements[id];
  },
  createElement(tagName) {
    return new Element(tagName);
  },
  createTextNode(text) {
    return new Element("#text", String(text));
  },
};

const html = fs.readFileSync(path.join(__dirname, "show-notes-assembly.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const sandbox = { document, module: { exports: {} } };

vm.runInNewContext(script, sandbox);

function allText(node) {
  return node.textContent;
}

function findChildByText(node, tagName, text) {
  return node.children.find((child) => child.tagName === tagName && child.textContent === text);
}

function sectionArticle(index) {
  const article = elements.sections.children[index];
  assert(article, `Missing section ${index}`);
  return article;
}

function checkboxForSection(index) {
  const article = sectionArticle(index);
  const includeRow = article.children.find((child) => child.className === "include-row");
  assert(includeRow, `Missing include row ${index}`);
  const checkbox = includeRow.children.find((child) => child.tagName === "input");
  assert(checkbox, `Missing checkbox ${index}`);
  return checkbox;
}

function textareaForSection(index) {
  const article = sectionArticle(index);
  const field = article.children.find((child) => child.className === "field");
  assert(field, `Missing field ${index}`);
  const textarea = field.children.find((child) => child.tagName === "textarea");
  assert(textarea, `Missing textarea ${index}`);
  return textarea;
}

function buttonInSection(index, text) {
  const article = sectionArticle(index);
  const actions = article.children.find((child) => child.className === "section-actions");
  assert(actions, `Missing actions ${index}`);
  const button = findChildByText(actions, "button", text);
  assert(button, `Missing button '${text}' in section ${index}`);
  return button;
}

function destinationButton(label) {
  const button = findChildByText(elements.destinations, "button", label);
  assert(button, `Missing destination button: ${label}`);
  return button;
}

assert.strictEqual(elements.summaryStatus.textContent, "2 open");
assert.strictEqual(elements.addToPackage.disabled, true);
assert.match(elements.issues.textContent, /Episode summary needs copy/);
assert.match(elements.issues.textContent, /Chapter list needs confirmed source text/);
assert.match(elements.combinedPreview.textContent, /Guest links/);
assert.doesNotMatch(elements.combinedPreview.textContent, /Episode summary/);

buttonInSection(1, "Pull confirmed chapters").click();
assert.strictEqual(elements.summaryStatus.textContent, "1 open");
assert.match(elements.combinedPreview.textContent, /Chapter list/);
assert.match(elements.packageList.textContent, /3 ready/);

const summaryField = textareaForSection(0);
summaryField.value = "A concise episode summary for the publish package.";
summaryField.dispatch("input");
assert.strictEqual(elements.summaryStatus.textContent, "Show notes ready");
assert.strictEqual(elements.addToPackage.disabled, false);
assert.match(elements.combinedPreview.textContent, /Episode summary/);
assert.match(elements.combinedPreview.textContent, /A concise episode summary for the publish package\./);
assert.match(elements.packageList.textContent, /4 ready/);

elements.addToPackage.click();
assert.strictEqual(elements.addToPackage.disabled, true);
assert.strictEqual(elements.addToPackage.textContent, "Notes added to package");
assert.match(elements.packageList.textContent, /added to the package summary/);
assert.match(elements.packageNote.textContent, /will reopen the package item before export/);

summaryField.value = "Updated publish summary after export review.";
summaryField.dispatch("input");
assert.strictEqual(elements.addToPackage.disabled, false);
assert.strictEqual(elements.addToPackage.textContent, "Add notes to export package");
assert.match(elements.packageNote.textContent, /Show notes stay tied to confirmed metadata/);
assert.match(elements.combinedPreview.textContent, /Updated publish summary after export review\./);

destinationButton("Client review copy").click();
assert.strictEqual(elements.summaryStatus.textContent, "Optional cleanup");
assert.strictEqual(elements.addToPackage.disabled, true);
assert.match(elements.issues.textContent, /is not used for Client review copy/);

checkboxForSection(3).checked = false;
checkboxForSection(3).dispatch("change");
assert.doesNotMatch(elements.issues.textContent, /Sponsor disclosure is not used for Client review copy/);

elements.resetSample.click();
assert.strictEqual(elements.summaryStatus.textContent, "2 open");
assert.strictEqual(elements.addToPackage.disabled, true);
assert.match(elements.packageNote.textContent, /Show notes stay tied to confirmed metadata/);
