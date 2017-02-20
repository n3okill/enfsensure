/**
 * @project enfsensure
 * @filename
 * @author Joao Parreira <joaofrparreira@gmail.com>
 * @copyright Copyright(c) 2016 Joao Parreira <joaofrparreira@gmail.com>
 * @licence Creative Commons Attribution 4.0 International License
 * @createdAt Created at 06-04-2016.
 * @version 0.0.1
 * @since 0.0.3
 * @description
 */

"use strict";

let util = {};
util.kindOf = (arg) => arg === null ? "null" : typeof arg === "undefined" ? "undefined" : /^\[object (.*)\]$/.exec(Object.prototype.toString.call(arg))[1];
util.isKind = (arg, kind) => util.kindOf(arg).toLowerCase() === kind.toLowerCase();
util.isFunction = (arg) => util.isKind(arg, "function");
util.isObject = (arg) => arg !== null && typeof arg !== "undefined" && util.isKind(arg, "object");
util.isString = (arg) => util.isKind(arg, "string");

module.exports = util;
