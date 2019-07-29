import { JSDOM } from 'jsdom';
import { Bookmark } from '../interfaces/bookmark';

export const canParse = (html: string) => {
  for (let i = 0; i < html.length; i++) {
    if (/\s/.test(html[i])) {
      continue;
    }
    if (html[i] === '<') {
      break;
    } else {
      return false;
    }
  }

  return (
    /<dl/i.test(html) &&
    /<\/dl/i.test(html) &&
    /<dt/i.test(html) &&
    /<a[^<>]href\s*=\s*/i.test(html)
  );
};

const getNodeData = (node: any) => {
  const data: Bookmark = {};

  for (let i = 0; i < node.childNodes.length; i++) {
    if (node.childNodes[i].tagName === 'A') {
      data.type = 'bookmark';
      data.url = node.childNodes[i].getAttribute('href');
      data.title = node.childNodes[i].textContent;

      const addDate = node.childNodes[i].getAttribute('add_date');
      if (addDate) {
        data.addDate = addDate;
      }

      const icon = node.childNodes[i].getAttribute('icon');
      if (icon) {
        data.icon = icon;
      }
    } else if (node.childNodes[i].tagName === 'H3') {
      data.type = 'folder';
      data.title = node.childNodes[i].textContent;

      const addDate = node.childNodes[i].getAttribute('add_date');
      const lastModified = node.childNodes[i].getAttribute('last_modified');

      if (addDate) {
        data.addDate = addDate;
      }

      if (lastModified) {
        data.lastModified = lastModified;
      }
      data.nsRoot = null;
      if (node.childNodes[i].hasAttribute('personal_toolbar_folder')) {
        data.nsRoot = 'toolbar';
      }
      if (node.childNodes[i].hasAttribute('unfiled_bookmarks_folder')) {
        data.nsRoot = 'unsorted';
      }
    } else if (node.childNodes[i].tagName === 'DL') {
      (data as any).__dir_dl = node.childNodes[i];
    }
  }

  if (data.type === 'folder' && !(data as any).__dir_dl) {
    if (node.nextSibling && node.nextSibling.tagName === 'DD') {
      const dls = node.nextSibling.getElementsByTagName('DL');
      if (dls.length) {
        (data as any).__dir_dl = dls[0];
      }
    }
  }

  return data;
};

const processDir = (dir: any, level: number) => {
  const children = dir.childNodes;
  let menuRoot: Bookmark = null;

  const items = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!child.tagName) {
      continue;
    }
    if (child.tagName !== 'DT') {
      continue;
    }
    const itemData = getNodeData(child);

    if (itemData.type) {
      if (level === 0 && !itemData.nsRoot) {
        if (!menuRoot) {
          menuRoot = {
            title: 'Menu',
            children: [],
            nsRoot: 'menu',
          };
        }
        if (itemData.type === 'folder' && (itemData as any).__dir_dl) {
          itemData.children = processDir((itemData as any).__dir_dl, level + 1);
          delete (itemData as any).__dir_dl;
        }
        menuRoot.children.push(itemData);
      } else {
        if (itemData.type === 'folder' && (itemData as any).__dir_dl) {
          itemData.children = processDir((itemData as any).__dir_dl, level + 1);
          delete (itemData as any).__dir_dl;
        }
        items.push(itemData);
      }
    }
  }
  if (menuRoot) {
    items.push(menuRoot);
  }
  return items;
};

export const parse = (html: string) => {
  const { window } = new JSDOM(html);

  const dls = window.document.getElementsByTagName('DL');

  if (dls.length > 0) {
    return processDir(dls[0], 0);
  }

  throw new Error(
    'Netscape parser: Bookmarks file malformed: no DL nodes were found',
  );
};
