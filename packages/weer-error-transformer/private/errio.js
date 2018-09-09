/*
Errio repository: https://github.com/programble/errio
This code derives from Errio libarary distributed under the following license.

Copyright © 2015, Curtis McEnroe curtis@cmcenroe.me

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*/

// Default options for all serializations.
const defaultOptions = {
  recursive: true, // Recursively serialize and deserialize nested errors
  inherited: true, // Include inherited properties
  stack: false,    // Include stack property
  private: false,  // Include properties with leading or trailing underscores
  exclude: [],     // Property names to exclude (low priority)
  include: [],     // Property names to include (high priority)
};

// Serialize an error instance to a plain object with option overrides, applied
// on top of the global defaults and the registered option overrides. If the
// constructor of the error instance has not been registered yet, register it
// with the provided options.
export const toObject = (error, callOptions = {}) => {

  const options = { ...defaultOptions, ...callOptions };

  // Always explicitly include essential error properties.
  const object = {
    name: error.name,
    message: error.message,
  };
  // Explicitly include stack since it is not always an enumerable property.
  if (options.stack) {
    object.stack = error.stack;
  }

  for (const prop in error) {
    // Skip exclusion checks if property is in include list.
    if (options.include.indexOf(prop) === -1) {
      if (typeof error[prop] === 'function') continue;

      if (options.exclude.indexOf(prop) !== -1) continue;

      if (!options.inherited) {
        if (!Object.prototype.hasOwnProperty.call(error, prop)) continue;
      }
      if (!options.stack) {
        if (prop === 'stack') continue;
      }
      if (!options.private) {
        if (prop[0] === '_' || prop[prop.length - 1] === '_') continue;
      }
    }

    const value = error[prop];

    // Recurse if nested object has name and message properties.
    if (typeof value === 'object' && value && value.name && value.message) {
      if (options.recursive) {
        object[prop] = toObject(value, options);
      }
      continue;
    }

    object[prop] = value;
  }

  return object;
};
