/*!
 * Font Awesome Pro 5.13.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License)
 */
(function () {
  'use strict';

  var _WINDOW = {};
  var _DOCUMENT = {};

  try {
    if (typeof window !== 'undefined') _WINDOW = window;
    if (typeof document !== 'undefined') _DOCUMENT = document;
  } catch (e) {}

  var _ref = _WINDOW.navigator || {},
      _ref$userAgent = _ref.userAgent,
      userAgent = _ref$userAgent === void 0 ? '' : _ref$userAgent;

  var WINDOW = _WINDOW;
  var DOCUMENT = _DOCUMENT;
  var IS_BROWSER = !!WINDOW.document;
  var IS_DOM = !!DOCUMENT.documentElement && !!DOCUMENT.head && typeof DOCUMENT.addEventListener === 'function' && typeof DOCUMENT.createElement === 'function';
  var IS_IE = ~userAgent.indexOf('MSIE') || ~userAgent.indexOf('Trident/');

  var NAMESPACE_IDENTIFIER = '___FONT_AWESOME___';
  var PRODUCTION = function () {
    try {
      return "production" === 'production';
    } catch (e) {
      return false;
    }
  }();

  function bunker(fn) {
    try {
      fn();
    } catch (e) {
      if (!PRODUCTION) {
        throw e;
      }
    }
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  var w = WINDOW || {};
  if (!w[NAMESPACE_IDENTIFIER]) w[NAMESPACE_IDENTIFIER] = {};
  if (!w[NAMESPACE_IDENTIFIER].styles) w[NAMESPACE_IDENTIFIER].styles = {};
  if (!w[NAMESPACE_IDENTIFIER].hooks) w[NAMESPACE_IDENTIFIER].hooks = {};
  if (!w[NAMESPACE_IDENTIFIER].shims) w[NAMESPACE_IDENTIFIER].shims = [];
  var namespace = w[NAMESPACE_IDENTIFIER];

  function defineIcons(prefix, icons) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _params$skipHooks = params.skipHooks,
        skipHooks = _params$skipHooks === void 0 ? false : _params$skipHooks;
    var normalized = Object.keys(icons).reduce(function (acc, iconName) {
      var icon = icons[iconName];
      var expanded = !!icon.icon;

      if (expanded) {
        acc[icon.iconName] = icon.icon;
      } else {
        acc[iconName] = icon;
      }

      return acc;
    }, {});

    if (typeof namespace.hooks.addPack === 'function' && !skipHooks) {
      namespace.hooks.addPack(prefix, normalized);
    } else {
      namespace.styles[prefix] = _objectSpread2(_objectSpread2({}, namespace.styles[prefix] || {}), normalized);
    }
    /**
     * Font Awesome 4 used the prefix of `fa` for all icons. With the introduction
     * of new styles we needed to differentiate between them. Prefix `fa` is now an alias
     * for `fas` so we'll easy the upgrade process for our users by automatically defining
     * this as well.
     */


    if (prefix === 'fas') {
      defineIcons('fa', icons);
    }
  }

  var icons = {
    "arrow-alt-down": [448, 512, [], "f354", ["M288,56V256H159.88V56a24,24,0,0,1,24-24H264A24,24,0,0,1,288,56Z", "M408.93,297,241,473a24.09,24.09,0,0,1-34,0L39.07,297c-15.11-15.09-4.4-41,17-41H391.93C413.35,256,424,281.76,408.93,297Z"]],
    "arrow-alt-up": [448, 512, [], "f357", ["M160,456V256H288.11V456a24,24,0,0,1-24,24H184A24,24,0,0,1,160,456Z", "M39.05,215,207,39a24.08,24.08,0,0,1,34,0L408.92,215c15.11,15.09,4.4,41-17,41H56.05C34.63,256,24,230.3,39.05,215Z"]],
    "bus": [512, 512, [], "f207", ["M352 448v32a32 32 0 0 0 32 32h32a32 32 0 0 0 32-32v-32zM64 480a32 32 0 0 0 32 32h32a32 32 0 0 0 32-32v-32H64zm64-192h256a32 32 0 0 0 32-32V128a32 32 0 0 0-32-32H128a32 32 0 0 0-32 32v128a32 32 0 0 0 32 32z", "M488 128h-8V80c0-44.8-99.2-80-224-80S32 35.2 32 80v48h-8a24 24 0 0 0-24 24v80a24 24 0 0 0 24 24h8v160a32 32 0 0 0 32 32h384a32 32 0 0 0 32-32V256h8a24 24 0 0 0 24-24v-80a24 24 0 0 0-24-24zm-392 0a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32v128a32 32 0 0 1-32 32H128a32 32 0 0 1-32-32zm16 272a32 32 0 1 1 32-32 32 32 0 0 1-32 32zm288 0a32 32 0 1 1 32-32 32 32 0 0 1-32 32z"]],
    "bus-alt": [512, 512, [], "f55e", ["M96 160v96a32 32 0 0 0 32 32h112V128H128a32 32 0 0 0-32 32zm320 96v-96a32 32 0 0 0-32-32H272v160h112a32 32 0 0 0 32-32zM64 480a32 32 0 0 0 32 32h32a32 32 0 0 0 32-32v-32H64zm288-32v32a32 32 0 0 0 32 32h32a32 32 0 0 0 32-32v-32z", "M488 128h-8V80c0-44.8-99.2-80-224-80S32 35.2 32 80v48h-8a24 24 0 0 0-24 24v80a24 24 0 0 0 24 24h8v160a32 32 0 0 0 32 32h384a32 32 0 0 0 32-32V256h8a24 24 0 0 0 24-24v-80a24 24 0 0 0-24-24zM112 400a32 32 0 1 1 32-32 32 32 0 0 1-32 32zm128-112H128a32 32 0 0 1-32-32v-96a32 32 0 0 1 32-32h112zM168 96a8 8 0 0 1-8-8V72a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H168zm104 32h112a32 32 0 0 1 32 32v96a32 32 0 0 1-32 32H272zm128 272a32 32 0 1 1 32-32 32 32 0 0 1-32 32z"]],
    "car": [512, 512, [], "f1b9", ["M319.5 128a48 48 0 0 1 44.57 30.17L384 208H128l19.93-49.83A48 48 0 0 1 192.5 128zM80 384a63.82 63.82 0 0 1-47.57-21.2A31.82 31.82 0 0 0 32 368v48a32 32 0 0 0 32 32h32a32 32 0 0 0 32-32v-32zm352 0h-48v32a32 32 0 0 0 32 32h32a32 32 0 0 0 32-32v-48a31.82 31.82 0 0 0-.43-5.2A63.82 63.82 0 0 1 432 384z", "M500 176h-59.88l-16.64-41.6A111.43 111.43 0 0 0 319.5 64h-127a111.47 111.47 0 0 0-104 70.4L71.87 176H12A12 12 0 0 0 .37 190.91l6 24A12 12 0 0 0 18 224h20.08A63.55 63.55 0 0 0 16 272v48a64 64 0 0 0 64 64h352a64 64 0 0 0 64-64v-48a63.58 63.58 0 0 0-22.07-48H494a12 12 0 0 0 11.64-9.09l6-24A12 12 0 0 0 500 176zm-352.07-17.83A48 48 0 0 1 192.5 128h127a48 48 0 0 1 44.57 30.17L384 208H128zM96 256c19.2 0 48 28.71 48 47.85s-28.8 15.95-48 15.95-32-12.8-32-31.9S76.8 256 96 256zm272 47.85c0-19.14 28.8-47.85 48-47.85s32 12.76 32 31.9-12.8 31.9-32 31.9-48 3.2-48-15.95z"]],
    "car-side": [640, 512, [], "f5e4", ["M144 320a80 80 0 1 0 80 80 80 80 0 0 0-80-80zm352 0a80 80 0 1 0 80 80 80 80 0 0 0-80-80zM369.24 96H280v96h166zm-252.31 96H232V96h-76.67z", "M16 384h17.14a112 112 0 0 1 221.72 0h130.28a112 112 0 0 1 221.72 0H624a16 16 0 0 0 16-16v-80a96 96 0 0 0-96-96h-16L419.22 56a64 64 0 0 0-50-24H155.33a64 64 0 0 0-59.42 40.23L48 194.26A63.85 63.85 0 0 0 0 256v112a16 16 0 0 0 16 16zM280 96h89.24L446 192H280zm-124.67 0H232v96H116.93z"]],
    "circle": [512, 512, [], "f111", ["M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 424c-97.06 0-176-79-176-176S158.94 80 256 80s176 79 176 176-78.94 176-176 176z", "M256 432c-97.06 0-176-79-176-176S158.94 80 256 80s176 79 176 176-78.94 176-176 176z"]],
    "clock": [512, 512, [], "f017", ["M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z", "M348.49,321h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z"]],
    "edit": [576, 512, [], "f044", ["M564.6 60.2l-48.8-48.8a39.11 39.11 0 0 0-55.2 0l-35.4 35.4a9.78 9.78 0 0 0 0 13.8l90.2 90.2a9.78 9.78 0 0 0 13.8 0l35.4-35.4a39.11 39.11 0 0 0 0-55.2zM427.5 297.6l-40 40a12.3 12.3 0 0 0-3.5 8.5v101.8H64v-320h229.8a12.3 12.3 0 0 0 8.5-3.5l40-40a12 12 0 0 0-8.5-20.5H48a48 48 0 0 0-48 48v352a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48V306.1a12 12 0 0 0-20.5-8.5z", "M492.8 173.3a9.78 9.78 0 0 1 0 13.8L274.4 405.5l-92.8 10.3a19.45 19.45 0 0 1-21.5-21.5l10.3-92.8L388.8 83.1a9.78 9.78 0 0 1 13.8 0z"]],
    "print": [512, 512, [], "f02f", ["M64 480a32 32 0 0 0 32 32h320a32 32 0 0 0 32-32v-96H64zM368 96a16 16 0 0 1-16-16V0H96a32 32 0 0 0-32 32v192h384V96z", "M368 96h80v-4.58a17.92 17.92 0 0 0-5.25-12.67l-73.43-73.5A18 18 0 0 0 356.57 0H352v80a16 16 0 0 0 16 16zm80 96v32H64v-32a64 64 0 0 0-64 64v112a16 16 0 0 0 16 16h480a16 16 0 0 0 16-16V256a64 64 0 0 0-64-64zm-16 136a24 24 0 1 1 24-24 24 24 0 0 1-24 24z"]],
    "sack": [512, 512, [], "f81c", ["M192 96h128l47.4-71.12A16 16 0 0 0 354.09 0H157.94a16 16 0 0 0-13.31 24.88zm128 32H192C-10.38 243.4.09 396.64.09 416c0 53 49.11 96 109.68 96h292.48c60.58 0 109.68-43 109.68-96 0-19 9.35-173.24-191.93-288z", "M337 104v16a8 8 0 0 1-8 8H183a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h146a8 8 0 0 1 8 8z"]],
    "slash": [640, 512, [], "f715", ["M636.63 480.55L617 505.82a16 16 0 0 1-22.46 2.81L6.18 53.9a16 16 0 0 1-2.81-22.45L23 6.18a16 16 0 0 1 22.47-2.81L633.82 458.1a16 16 0 0 1 2.81 22.45z", ""]],
    "spinner": [512, 512, [], "f110", ["M108.92 355.08a48 48 0 1 0 48 48 48 48 0 0 0-48-48zM256 416a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm208-208a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm-60.92 147.08a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0-198.16a48 48 0 1 0-48-48 48 48 0 0 0 48 48z", "M108.92 60.92a48 48 0 1 0 48 48 48 48 0 0 0-48-48zM48 208a48 48 0 1 0 48 48 48 48 0 0 0-48-48zM256 0a48 48 0 1 0 48 48 48 48 0 0 0-48-48z"]],
    "spinner-third": [512, 512, [], "f3f4", ["M478.71 364.58zm-22 6.11l-27.83-15.9a15.92 15.92 0 0 1-6.94-19.2A184 184 0 1 1 256 72c5.89 0 11.71.29 17.46.83-.74-.07-1.48-.15-2.23-.21-8.49-.69-15.23-7.31-15.23-15.83v-32a16 16 0 0 1 15.34-16C266.24 8.46 261.18 8 256 8 119 8 8 119 8 256s111 248 248 248c98 0 182.42-56.95 222.71-139.42-4.13 7.86-14.23 10.55-22 6.11z", "M271.23 72.62c-8.49-.69-15.23-7.31-15.23-15.83V24.73c0-9.11 7.67-16.78 16.77-16.17C401.92 17.18 504 124.67 504 256a246 246 0 0 1-25 108.24c-4 8.17-14.37 11-22.26 6.45l-27.84-15.9c-7.41-4.23-9.83-13.35-6.2-21.07A182.53 182.53 0 0 0 440 256c0-96.49-74.27-175.63-168.77-183.38z"]],
    "user": [448, 512, [], "f007", ["M352 128A128 128 0 1 1 224 0a128 128 0 0 1 128 128z", "M313.6 288h-16.7a174.1 174.1 0 0 1-145.8 0h-16.7A134.43 134.43 0 0 0 0 422.4V464a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48v-41.6A134.43 134.43 0 0 0 313.6 288z"]]
  };

  bunker(function () {
    defineIcons('fad', icons);
  });

}());
