exports.getAttribute = (node, attr) => {
    let out = "";
    if (node.attributes.length > 0) {
        for (let i = 0; i < node.attributes.length; i++) {
            if (node.attributes[i].name === attr) {
                out = node.attributes[i].value;
            }
        }
    }
    return out;
};