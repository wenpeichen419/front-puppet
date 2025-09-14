import { inject, watch, onMounted, onUpdated, ref } from 'vue';

/**
 * A composable function for in-page text search and highlighting.
 * @param {import('vue').Ref<HTMLElement | null>} target - A ref pointing to the root element to search within.
 */
export function useSearch(target) {
  const searchKeyword = inject('searchKeyword', ref(''));
  const searchTrigger = inject('searchTrigger', ref(0));

  let originalHTMLs = new Map();

  const restoreOriginals = () => {
    originalHTMLs.forEach((html, el) => {
      el.innerHTML = html;
    });
    originalHTMLs.clear();
  };

  const highlight = () => {
    restoreOriginals();

    if (!target.value || !searchKeyword.value?.trim()) {
      return;
    }

    const keyword = searchKeyword.value.trim();
    const walker = document.createTreeWalker(target.value, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      // Avoid highlighting text within script, style, or already highlighted elements
      if (currentNode.parentElement && !['SCRIPT', 'STYLE', 'MARK'].includes(currentNode.parentElement.tagName)) {
        textNodes.push(currentNode);
      }
      currentNode = walker.nextNode();
    }

    const regex = new RegExp(`(${keyword})`, 'gi');

    textNodes.forEach(node => {
      const content = node.textContent;
      if (content && regex.test(content)) {
        const parent = node.parentElement;
        if (parent && !originalHTMLs.has(parent)) {
          originalHTMLs.set(parent, parent.innerHTML);
        }
        
        const newHTML = content.replace(regex, '<mark>$1</mark>');
        
        // Replace the text node with a temporary element that contains the new HTML
        const tempEl = document.createElement('span');
        tempEl.innerHTML = newHTML;
        
        parent.replaceChild(tempEl, node);
        // Now, unwrap the content of the temporary element
        while (tempEl.firstChild) {
          parent.insertBefore(tempEl.firstChild, tempEl);
        }
        parent.removeChild(tempEl);
      }
    });
  };

  // Watch for search trigger changes
  watch(searchTrigger, highlight);

  // Watch for keyword changes to clear highlights if keyword is cleared
  watch(searchKeyword, (newVal) => {
    if (!newVal?.trim()) {
      restoreOriginals();
    }
  });

  // Re-apply on component updates
  onUpdated(highlight);

  // Clean up when the component is unmounted
  onMounted(restoreOriginals);
}
