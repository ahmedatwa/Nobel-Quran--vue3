// Credit: https://gist.github.com/jonlabelle/5375315

export const trimSpaces = (str: string) => {
  return str.trim();
};

export const lowerCase = (str: string) => {
  return str.toLowerCase();
};

export const upperCase = (str: string) => {
  return str.toUpperCase();
};

export const camelCase = (str: string) => {
  str = replaceAccents(str);
  str = removeNonWord(str)
    .replace(/\-/g, " ") //convert all hyphens to spaces
    .replace(/\s[a-z]/g, upperCase) //convert first char of each word to UPPERCASE
    .replace(/\s+/g, "") //remove spaces
    .replace(/^[A-Z]/g, lowerCase); //convert first char to lowercase
  return str;
};

// String utils
//
// resources:
//  -- mout, https://github.com/mout/mout/tree/master/src/string

/**
 * Add space between camelCase text.
 */
export const unCamelCase = (str: string) => {
  str = str.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, "$1 $2");
  str = str.toLowerCase(); //add space between camelCase text
  return str;
};

/**
 * UPPERCASE first char of each word.
 */
export const properCase = (str: string) => {
  return lowerCase(str).replace(/^\w|\s\w/g, upperCase);
};

/**
 * camelCase + UPPERCASE first char
 */
export const pascalCase = (str: string) => {
  return camelCase(str).replace(/^[a-z]/, upperCase);
};

/**
 * UPPERCASE first char of each sentence and lowercase other chars.
 */
export const sentenceCase = (str: string) => {
  // Replace first char of each sentence (new line or after '.\s+') to
  // UPPERCASE
  return lowerCase(str).replace(/(^\w)|\.\s+(\w)/gm, upperCase);
};

/**
 * Convert to lower case, remove accents, remove non-word chars and
 * replace spaces with the specified delimeter.
 * Does not split camelCase text.
 */
export const slugify = (str: string, delimeter?: string) => {
  delimeter = delimeter ? delimeter : "-";

  str = replaceAccents(str);
  str = removeNonWord(str);
  str = trim(str) //should come after removeNonWord
    .replace(/ +/g, delimeter) //replace spaces with delimeter
    .toLowerCase();

  return str;
};

/**
 * Replaces spaces with hyphens, split camelCase text, remove non-word chars, remove accents and convert to lower case.
 */
export const hyphenate = (str: string) => {
  str = unCamelCase(str);
  return slugify(str, "-");
};

/**
 * Replaces hyphens with spaces. (only hyphens between word chars)
 */
export const unhyphenate = (str: string) => {
  return str.replace(/(\w)(-)(\w)/g, "$1 $3");
};

/**
 * Replaces spaces with underscores, split camelCase text, remove
 * non-word chars, remove accents and convert to lower case.
 */
export const underscore = (str: string) => {
  str = unCamelCase(str);
  return slugify(str, "_");
};

/**
 * Remove non-word chars.
 */
export const removeNonWord = (str: string) => {
  return str.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, "");
};

/**
 * Convert line-breaks from DOS/MAC to a single standard (UNIX by default)
 */
export const normalizeLineBreaks = (str: string, lineEnd: string) => {
  lineEnd = lineEnd || "\n";

  return str
    .replace(/\r\n/g, lineEnd) // DOS
    .replace(/\r/g, lineEnd) // Mac
    .replace(/\n/g, lineEnd); // Unix
};

/**
 * Replaces all accented chars with regular ones
 */
export const replaceAccents = (str: string) => {
  // verifies if the String has accents and replace them
  if (str.search(/[\xC0-\xFF]/g) > -1) {
    str = str
      .replace(/[\xC0-\xC5]/g, "A")
      .replace(/[\xC6]/g, "AE")
      .replace(/[\xC7]/g, "C")
      .replace(/[\xC8-\xCB]/g, "E")
      .replace(/[\xCC-\xCF]/g, "I")
      .replace(/[\xD0]/g, "D")
      .replace(/[\xD1]/g, "N")
      .replace(/[\xD2-\xD6\xD8]/g, "O")
      .replace(/[\xD9-\xDC]/g, "U")
      .replace(/[\xDD]/g, "Y")
      .replace(/[\xDE]/g, "P")
      .replace(/[\xE0-\xE5]/g, "a")
      .replace(/[\xE6]/g, "ae")
      .replace(/[\xE7]/g, "c")
      .replace(/[\xE8-\xEB]/g, "e")
      .replace(/[\xEC-\xEF]/g, "i")
      .replace(/[\xF1]/g, "n")
      .replace(/[\xF2-\xF6\xF8]/g, "o")
      .replace(/[\xF9-\xFC]/g, "u")
      .replace(/[\xFE]/g, "p")
      .replace(/[\xFD\xFF]/g, "y");
  }

  return str;
};

/**
 * Searches for a given substring
 */
export const contains = (str: string, substring: string, fromIndex: number) => {
  return str.indexOf(substring, fromIndex) !== -1;
};

/**
 * Truncate string at full words.
 */
export const crop = (str: string, maxChars: number, append?: string) => {
  return truncate(str, maxChars, append, true);
};

/**
 * Escape RegExp string chars.
 */
export const escapeRegExp = (str: string) => {
  var ESCAPE_CHARS = /[\\.+*?\^$\[\](){}\/'#]/g;
  return str.replace(ESCAPE_CHARS, "\\$&");
};

/**
 * Escapes a string for insertion into HTML.
 */
export const escapeHtml = (str: string) => {
  str = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;");

  return str;
};

/**
 * Unescapes HTML special chars
 */
export const unescapeHtml = (str: string) => {
  str = str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
  return str;
};

// /**
//  * Escape string into unicode sequences
//  */
// export const escapeUnicode = (str: string, shouldEscapePrintable: boolean) => {
//   return str.replace(/[\s\S]/g, export const (ch) {
//     // skip printable ASCII chars if we should not escape them
//     if (!shouldEscapePrintable && /[\x20-\x7E]/.test(ch)) {
//       return ch;
//     }
//     // we use "000" and slice(-4) for brevity, need to pad zeros,
//     // unicode escape always have 4 chars after "\u"
//     return "\\u" + ("000" + ch.charCodeAt(0).toString(16)).slice(-4);
//   });
// }

/**
 * Remove HTML tags from string.
 */
export const stripHtmlTags = (str: string) => {
  return str.replace(/<[^>]*>/g, "");
};

/**
 * Remove non-printable ASCII chars
 */
export const removeNonASCII = (str: string) => {
  // Matches non-printable ASCII chars -
  // http://en.wikipedia.org/wiki/ASCII#ASCII_printable_characters
  return str.replace(/[^\x20-\x7E]/g, "");
};

/**
 * Pad string with `char` if its' length is smaller than `minLen`
 */
export const rpad = (str: string, minLen: number, ch: string) => {
  ch = ch || " ";
  return str.length < minLen ? str + repeat(ch, minLen - str.length) : str;
};

/**
 * Pad string with `char` if its' length is smaller than `minLen`
 */
export const lpad = (str: string, minLen: number, ch: string) => {
  ch = ch || " ";

  return str.length < minLen ? repeat(ch, minLen - str.length) + str : str;
};

/**
 * Repeat string n times
 */
export const repeat = (str: string, n: number) => {
  return new Array(n + 1).join(str);
};

/**
 * Limit number of chars.
 */
export const truncate = (
  str: string,
  maxChars: number,
  append?: string,
  onlyFullWords?: boolean
) => {
  append = append || "...";
  maxChars = onlyFullWords ? maxChars + 1 : maxChars;

  str = trim(str);
  if (str.length <= maxChars) {
    return str;
  }
  str = str.substring(0, maxChars - append.length);
  //crop at last space or remove trailing whitespace
  str = onlyFullWords ? str.substr(0, str.lastIndexOf(" ")) : trim(str);
  return str + append;
};

var WHITE_SPACES = [
  " ",
  "\n",
  "\r",
  "\t",
  "\f",
  "\v",
  "\u00A0",
  "\u1680",
  "\u180E",
  "\u2000",
  "\u2001",
  "\u2002",
  "\u2003",
  "\u2004",
  "\u2005",
  "\u2006",
  "\u2007",
  "\u2008",
  "\u2009",
  "\u200A",
  "\u2028",
  "\u2029",
  "\u202F",
  "\u205F",
  "\u3000",
];

/**
 * Remove chars from beginning of string.
 */
export const ltrim = (str: string, chars: string[]) => {
  chars = chars || WHITE_SPACES;

  var start = 0,
    len = str.length,
    charLen = chars.length,
    found = true,
    i,
    c;

  while (found && start < len) {
    found = false;
    i = -1;
    c = str.charAt(start);

    while (++i < charLen) {
      if (c === chars[i]) {
        found = true;
        start++;
        break;
      }
    }
  }

  return start >= len ? "" : str.substr(start, len);
};

/**
 * Remove chars from end of string.
 */
export const rtrim = (str: string, chars: unknown[]) => {
  chars = chars || WHITE_SPACES;

  var end = str.length - 1,
    charLen = chars.length,
    found = true,
    i,
    c;

  while (found && end >= 0) {
    found = false;
    i = -1;
    c = str.charAt(end);

    while (++i < charLen) {
      if (c === chars[i]) {
        found = true;
        end--;
        break;
      }
    }
  }

  return end >= 0 ? str.substring(0, end + 1) : "";
};

/**
 * Remove white-spaces from beginning and end of string.
 */
export const trim = (str: string, chars?: string[]) => {
  chars = chars || WHITE_SPACES;
  return ltrim(rtrim(str, chars), chars);
};

/**
 * Capture all capital letters following a word boundary (in case the
 * input is in all caps)
 */
export const abbreviate = (str: string) => {
  return str.match(/\b([A-Z])/g)?.join("");
};
