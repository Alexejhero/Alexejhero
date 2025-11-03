function applyText(element, text) {
    if (!element) return;
    if (text) {
        element.textContent = text;
        element.hidden = false;
    } else {
        element.textContent = '';
        element.hidden = true;
    }
}