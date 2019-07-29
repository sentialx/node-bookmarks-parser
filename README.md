# node-bookmarks-parser

This library can parse following formats:

- Netscape Bookmarks (Google Chrome)

## Installation

`npm install node-bookmarks-parser`

Example:

```typescript
import parse from "node-bookmarks-parser";

try {
  const html = ...;
  const bookmarks = parse(html);
} catch (e) {
  console.error(e);
}
```

## Documentation

### Methods

#### `parse(text: string, options?: Options)`

- `text` string
- `options` object - an optional parameter with following fields:
  - `parser` string - `netscape` (default)

Returns [`Bookmark[]`](#bookmark)

### Objects

#### `Bookmark`

- `type` string - `folder` or `bookmark`
- `title` string - title of a bookmark or a folder
- `url` string - URL only for bookmarks
- `children` [`Bookmark[]`](#bookmark) - array of children bookmarks, only for folders
- `addDate` string
- `lastModified` string
- `icon` string - favicon in a base64 encoded string
- `nsRoot` string - if the folder is a root this field will contain one of the values: `menu`, `toolbar`, `unsorted`, otherwise `null`. Applicable only for `netscape` parser.
