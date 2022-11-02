const container = document.getElementById("container");

function handleClick() {
  console.log("clicked");
}

const vnode = h(
  "div",
  { id: "element", class: "two classes", on: { click: handleClick } },
  [
    h("span", { class: "text-class1" }, "This is black"),
    " and this is just normal text",
    h("a", { href: "/foo" }, "I'll take you places!"),
  ]
);

const eventTypeMap ={
    'click' :  function(node, i){
        node.addEventListener(i)
    }
}

// Patch into empty DOM element
patch(container, vnode);

function h(nodeName, attr, value) {
  const node = document.createElementByTagName(nodeName);

  attr.forEach((a) => {
    if (a === "on") {
      Object.keys(on).forEach((i) => {
        document.addEventListener(a, i)
      });
      return;
    }
    node.setAttribute(a, attr[a]);
  });

  if (value) {
    if (typeof value === "string") {
      node.value = value;
    } else {
      value.forEach((i) => {
        node.appendChild(i);
      });
    }
  }
  return node;
}

function patch(root, node) {
  if (!root || !node) return;
  // 分析node节点
  root.appendChild(node);
}
