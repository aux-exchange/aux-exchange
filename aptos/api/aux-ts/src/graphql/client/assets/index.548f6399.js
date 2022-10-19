var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { r as react, c as create$1, W as We, g as gt$1, R as React, p as pt$1, m as mt$1, q as qe$1, O as Oe, u as useAnimationControls, a as motion, b as useNavigate, d as useLocation, e as be, G as Ge$1, S as Slider, f as useReactTable, h as flexRender, i as getCoreRowModel, j as getSortedRowModel, k as jsx, l as useSubscription, n as useQuery, o as useMutation, F as Fragment, D as DateTime, s as jsxs, L as Link, X as XMarkIcon, t as Do, C as ChevronDownIcon, v as ChevronUpIcon, M as MagnifyingGlassIcon, A as ArrowDownIcon, w as ArrowLongLeftIcon, x as useLazyQuery, y as linear, z as colors_1, N as NavLink, B as ArrowsUpDownIcon, H as HttpLink, E as GraphQLWsLink, I as createClient, J as split, K as getMainDefinition, P as ApolloClient, Q as InMemoryCache, T as useGeoLocation, U as ApolloProvider, V as BrowserRouter, Y as Routes, Z as Route, _ as client$1 } from "./vendor.6f418bc8.js";
import "./__commonjsHelpers__.5615ff64.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const tailwind = "";
const App$1 = "";
const index$1 = "";
var se = { exports: {} }, W = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ze;
function et() {
  if (Ze)
    return W;
  Ze = 1;
  var e2 = React, t2 = Symbol.for("react.element"), s2 = Symbol.for("react.fragment"), n2 = Object.prototype.hasOwnProperty, o2 = e2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, l = { key: true, ref: true, __self: true, __source: true };
  function c(f, d, h) {
    var m, y = {}, v = null, C = null;
    h !== void 0 && (v = "" + h), d.key !== void 0 && (v = "" + d.key), d.ref !== void 0 && (C = d.ref);
    for (m in d)
      n2.call(d, m) && !l.hasOwnProperty(m) && (y[m] = d[m]);
    if (f && f.defaultProps)
      for (m in d = f.defaultProps, d)
        y[m] === void 0 && (y[m] = d[m]);
    return { $$typeof: t2, type: f, key: v, ref: C, props: y, _owner: o2.current };
  }
  return W.Fragment = s2, W.jsx = c, W.jsxs = c, W;
}
(function(e2) {
  e2.exports = et();
})(se);
const oe = se.exports.Fragment, a = se.exports.jsx, g = se.exports.jsxs;
function tt({
  title: e2,
  titleId: t2,
  ...s2
}, n2) {
  return /* @__PURE__ */ g("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: n2,
      "aria-labelledby": t2
    }, s2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: t2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
    })]
  });
}
const nt = react.exports.forwardRef(tt), at = nt;
function st({
  title: e2,
  titleId: t2,
  ...s2
}, n2) {
  return /* @__PURE__ */ g("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: n2,
      "aria-labelledby": t2
    }, s2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: t2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
    })]
  });
}
const ot = react.exports.forwardRef(st), it = ot;
function lt({
  title: e2,
  titleId: t2,
  ...s2
}, n2) {
  return /* @__PURE__ */ g("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: n2,
      "aria-labelledby": t2
    }, s2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: t2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    })]
  });
}
const ct = react.exports.forwardRef(lt), tr = ct;
function ut({
  title: e2,
  titleId: t2,
  ...s2
}, n2) {
  return /* @__PURE__ */ g("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: n2,
      "aria-labelledby": t2
    }, s2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: t2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M19.5 8.25l-7.5 7.5-7.5-7.5"
    })]
  });
}
const dt = react.exports.forwardRef(ut), ft = dt;
function ht({
  title: e2,
  titleId: t2,
  ...s2
}, n2) {
  return /* @__PURE__ */ g("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: n2,
      "aria-labelledby": t2
    }, s2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: t2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M4.5 15.75l7.5-7.5 7.5 7.5"
    })]
  });
}
const mt = react.exports.forwardRef(ht), pt = mt;
function gt({
  title: e2,
  titleId: t2,
  ...s2
}, n2) {
  return /* @__PURE__ */ g("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: n2,
      "aria-labelledby": t2
    }, s2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: t2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
    })]
  });
}
const vt = react.exports.forwardRef(gt), nr = vt;
function bt({
  title: e2,
  titleId: t2,
  ...s2
}, n2) {
  return /* @__PURE__ */ g("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: n2,
      "aria-labelledby": t2
    }, s2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: t2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
    })]
  });
}
const yt = react.exports.forwardRef(bt), ar = yt;
function wt({
  title: e2,
  titleId: t2,
  ...s2
}, n2) {
  return /* @__PURE__ */ g("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: n2,
      "aria-labelledby": t2
    }, s2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: t2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    })]
  });
}
const Ct = react.exports.forwardRef(wt), sr = Ct;
function xt({
  title: e2,
  titleId: t2,
  ...s2
}, n2) {
  return /* @__PURE__ */ g("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: n2,
      "aria-labelledby": t2
    }, s2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: t2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M6 18L18 6M6 6l12 12"
    })]
  });
}
const Et = react.exports.forwardRef(xt), Rt = Et;
function or({
  title: e2,
  message: t2,
  variant: s2,
  details: n2
}) {
  const o2 = "flex self-stretch items-center bg-primary-900 h-auto p-4 z-10 border-l-4 rounded-sm text-primary-100 border-y border-r border-y-primary-700", l = {
    basic: " border-l-secondary-400",
    success: " border-l-green-400",
    error: " border-l-red-400",
    warning: " border-l-orange-400",
    info: " border-l-blue-500"
  }, c = o2 + (s2 ? l[s2] : l.basic);
  return /* @__PURE__ */ g("div", {
    role: "alert",
    className: c,
    children: [s2 === "error" ? /* @__PURE__ */ a(sr, {
      className: "w-10 h-10 text-red-400"
    }) : s2 === "success" ? /* @__PURE__ */ a(tr, {
      className: "w-10 h-10 text-green-400"
    }) : s2 === "warning" ? /* @__PURE__ */ a(nr, {
      className: "w-10 h-10 text-orange-400"
    }) : s2 === "info" ? /* @__PURE__ */ a(ar, {
      className: "w-10 h-10 text-secondary-400"
    }) : null, /* @__PURE__ */ g("div", {
      className: "flex flex-col justify-between ml-3 w-full",
      children: [e2 && /* @__PURE__ */ a("div", {
        className: "text-lg font-semibold",
        children: e2
      }), t2 && /* @__PURE__ */ a("div", {
        className: "text-primary-300",
        children: t2
      }), n2 && /* @__PURE__ */ a("div", {
        className: "text-primary-400 text-sm",
        children: n2
      })]
    })]
  });
}
function kt({}) {
  return /* @__PURE__ */ g("div", {
    role: "status",
    className: "flex flex-col gap-2 p-4 w-full h-full animate-pulse overflow-hidden",
    children: [/* @__PURE__ */ a("div", {
      className: "h-6 bg-primary-200 rounded-md dark:bg-primary-700"
    }), /* @__PURE__ */ a("div", {
      className: "h-6 bg-primary-200 rounded-md dark:bg-primary-700"
    }), /* @__PURE__ */ a("div", {
      className: "h-6 bg-primary-200 rounded-md dark:bg-primary-700"
    }), /* @__PURE__ */ a("div", {
      className: "h-6 bg-primary-200 rounded-md dark:bg-primary-700"
    }), /* @__PURE__ */ a("div", {
      className: "h-6 bg-primary-200 rounded-md dark:bg-primary-700"
    }), /* @__PURE__ */ a("div", {
      className: "h-6 bg-primary-200 rounded-md dark:bg-primary-700"
    }), /* @__PURE__ */ a("div", {
      className: "h-6 bg-primary-200 rounded-md dark:bg-primary-700"
    }), /* @__PURE__ */ a("div", {
      className: "h-6 bg-primary-200 rounded-md dark:bg-primary-700"
    }), /* @__PURE__ */ a("span", {
      className: "sr-only",
      children: "Loading..."
    })]
  });
}
function Xe({}) {
  return /* @__PURE__ */ g("div", {
    role: "status",
    className: "w-full animate-pulse px-4",
    children: [/* @__PURE__ */ a("div", {
      className: "h-12 bg-primary-200 rounded-md dark:bg-primary-700 w-48 mb-4"
    }), /* @__PURE__ */ a("div", {
      className: "h-12 bg-primary-200 rounded-md dark:bg-primary-700 w-48 mb-4"
    }), /* @__PURE__ */ a("div", {
      className: "h-12 bg-primary-200 rounded-md dark:bg-primary-700 w-48 mb-4"
    }), /* @__PURE__ */ a("div", {
      className: "h-12 bg-primary-200 rounded-md dark:bg-primary-700 w-48 mb-4"
    }), /* @__PURE__ */ a("div", {
      className: "h-12 bg-primary-200 rounded-md dark:bg-primary-700 w-48 mb-4"
    }), /* @__PURE__ */ a("div", {
      className: "h-4 bg-primary-200 rounded-md dark:bg-primary-700"
    }), /* @__PURE__ */ a("span", {
      className: "sr-only",
      children: "Loading..."
    })]
  });
}
function St({}) {
  return /* @__PURE__ */ g("div", {
    role: "status",
    className: "p-4 max-w-sm rounded border border-gray-200 shadow animate-pulse md:p-6 dark:border-gray-700",
    children: [/* @__PURE__ */ g("div", {
      className: "flex items-center mt-4 space-x-3",
      children: [/* @__PURE__ */ a("svg", {
        className: "w-14 h-14 text-gray-200 dark:text-gray-700",
        "aria-hidden": "true",
        fill: "currentColor",
        viewBox: "0 0 20 20",
        xmlns: "http://www.w3.org/2000/svg",
        children: /* @__PURE__ */ a("path", {
          "fill-rule": "evenodd",
          d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z",
          "clip-rule": "evenodd"
        })
      }), /* @__PURE__ */ g("div", {
        children: [/* @__PURE__ */ a("div", {
          className: "h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"
        }), /* @__PURE__ */ a("div", {
          className: "w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"
        })]
      })]
    }), /* @__PURE__ */ a("span", {
      className: "sr-only",
      children: "Loading..."
    })]
  });
}
function Ot({}) {
  return /* @__PURE__ */ g("div", {
    role: "status",
    className: "p-4 max-w-sm rounded border border-primary-200 shadow animate-pulse md:p-6 dark:border-primary-700",
    children: [/* @__PURE__ */ a("div", {
      className: "h-2.5 bg-primary-200 rounded-full dark:bg-primary-700 w-32 mb-2.5"
    }), /* @__PURE__ */ a("div", {
      className: "mb-10 w-48 h-2 bg-primary-200 rounded-full dark:bg-primary-700"
    }), /* @__PURE__ */ g("div", {
      className: "flex items-baseline mt-4 space-x-6",
      children: [/* @__PURE__ */ a("div", {
        className: "w-full h-72 bg-primary-200 rounded-t-lg dark:bg-primary-700"
      }), /* @__PURE__ */ a("div", {
        className: "w-full h-56 bg-primary-200 rounded-t-lg dark:bg-primary-700"
      }), /* @__PURE__ */ a("div", {
        className: "w-full h-72 bg-primary-200 rounded-t-lg dark:bg-primary-700"
      }), /* @__PURE__ */ a("div", {
        className: "w-full h-64 bg-primary-200 rounded-t-lg dark:bg-primary-700"
      }), /* @__PURE__ */ a("div", {
        className: "w-full h-80 bg-primary-200 rounded-t-lg dark:bg-primary-700"
      }), /* @__PURE__ */ a("div", {
        className: "w-full h-72 bg-primary-200 rounded-t-lg dark:bg-primary-700"
      }), /* @__PURE__ */ a("div", {
        className: "w-full h-80 bg-primary-200 rounded-t-lg dark:bg-primary-700"
      })]
    }), /* @__PURE__ */ a("span", {
      className: "sr-only",
      children: "Loading..."
    })]
  });
}
function ir({
  variant: e2
}) {
  return (() => {
    switch (e2) {
      case "table":
        return /* @__PURE__ */ a(kt, {});
      case "list":
        return /* @__PURE__ */ a(Xe, {});
      case "card":
        return /* @__PURE__ */ a(St, {});
      case "tv":
        return /* @__PURE__ */ a(Ot, {});
      default:
        return /* @__PURE__ */ a(Xe, {});
    }
  })();
}
function D(e2, t2) {
  if (Object.is(e2, t2))
    return true;
  if (typeof e2 != "object" || e2 === null || typeof t2 != "object" || t2 === null)
    return false;
  const s2 = Object.keys(e2);
  if (s2.length !== Object.keys(t2).length)
    return false;
  for (let n2 = 0; n2 < s2.length; n2++)
    if (!Object.prototype.hasOwnProperty.call(t2, s2[n2]) || !Object.is(e2[s2[n2]], t2[s2[n2]]))
      return false;
  return true;
}
let Q;
const Nt = new Uint8Array(16);
function _t() {
  if (!Q && (Q = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !Q))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return Q(Nt);
}
const N = [];
for (let e2 = 0; e2 < 256; ++e2)
  N.push((e2 + 256).toString(16).slice(1));
function Tt(e2, t2 = 0) {
  return (N[e2[t2 + 0]] + N[e2[t2 + 1]] + N[e2[t2 + 2]] + N[e2[t2 + 3]] + "-" + N[e2[t2 + 4]] + N[e2[t2 + 5]] + "-" + N[e2[t2 + 6]] + N[e2[t2 + 7]] + "-" + N[e2[t2 + 8]] + N[e2[t2 + 9]] + "-" + N[e2[t2 + 10]] + N[e2[t2 + 11]] + N[e2[t2 + 12]] + N[e2[t2 + 13]] + N[e2[t2 + 14]] + N[e2[t2 + 15]]).toLowerCase();
}
const Mt = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), Je = {
  randomUUID: Mt
};
function Pt(e2, t2, s2) {
  if (Je.randomUUID && !t2 && !e2)
    return Je.randomUUID();
  e2 = e2 || {};
  const n2 = e2.random || (e2.rng || _t)();
  if (n2[6] = n2[6] & 15 | 64, n2[8] = n2[8] & 63 | 128, t2) {
    s2 = s2 || 0;
    for (let o2 = 0; o2 < 16; ++o2)
      t2[s2 + o2] = n2[o2];
    return t2;
  }
  return Tt(n2);
}
var L = /* @__PURE__ */ ((e2) => (e2.basic = "basic", e2.error = "error", e2.warning = "warning", e2.info = "info", e2.success = "success", e2))(L || {});
const ye = create$1((e2) => ({
  notifications: [],
  addNotification(t2) {
    return e2((s2) => ({
      ...s2,
      notifications: s2.notifications.concat({
        ...t2,
        id: Pt()
      })
    }));
  },
  removeNotification(t2) {
    return e2((s2) => ({
      ...s2,
      notifications: s2.notifications.filter((n2) => t2 !== n2)
    }));
  }
}));
function Lt() {
  const e2 = ye((n2) => n2.notifications, D), t2 = ye((n2) => n2.addNotification, D);
  return {
    removeNotification: ye((n2) => n2.removeNotification, D),
    addNotification: t2,
    notifications: e2
  };
}
const ee = create$1((e2) => ({
  params: new URLSearchParams(window.location.search),
  setParams: (t2) => e2((s2) => ({
    params: new URLSearchParams(t2)
  })),
  addParams: (...t2) => e2((s2) => {
    const n2 = s2.params;
    return t2.forEach(({
      key: o2,
      value: l
    }) => {
      if (!n2.has(o2))
        n2.append(o2, l);
      else {
        const f = `${n2.get(o2)},${l}`;
        n2.set(o2, f);
      }
    }), {
      params: new URLSearchParams(n2)
    };
  }),
  removeParams: (...t2) => e2((s2) => {
    const n2 = s2.params;
    return t2.forEach(({
      key: o2,
      value: l
    }) => {
      if (n2.has(o2)) {
        const c = n2.get(o2);
        if (c) {
          const f = c.split(",").filter((d) => d !== l);
          f.length ? n2.set(o2, f.join(",")) : n2.delete(o2);
        }
      }
    }), {
      params: new URLSearchParams(n2)
    };
  })
}));
function On() {
  const e2 = useNavigate(), t2 = useLocation(), s2 = ee((c) => c.params, D), n2 = ee((c) => c.setParams, D), o2 = ee((c) => c.addParams, D), l = ee((c) => c.removeParams, D);
  return react.exports.useEffect(() => {
    const c = `${t2.pathname}?${new URLSearchParams(t2.search).toString()}`;
    `${t2.pathname}?${s2.toString()}` !== c && e2(`${t2.pathname}?${s2.toString()}`);
  }, [s2.toString(), t2]), {
    params: s2,
    setParams: n2,
    addParams: o2,
    removeParams: l
  };
}
function lr(e2) {
  var t2, s2, n2 = "";
  if (typeof e2 == "string" || typeof e2 == "number")
    n2 += e2;
  else if (typeof e2 == "object")
    if (Array.isArray(e2))
      for (t2 = 0; t2 < e2.length; t2++)
        e2[t2] && (s2 = lr(e2[t2])) && (n2 && (n2 += " "), n2 += s2);
    else
      for (t2 in e2)
        e2[t2] && (n2 && (n2 += " "), n2 += t2);
  return n2;
}
function $t() {
  for (var e2, t2, s2 = 0, n2 = ""; s2 < arguments.length; )
    (e2 = arguments[s2++]) && (t2 = lr(e2)) && (n2 && (n2 += " "), n2 += t2);
  return n2;
}
const Ft = (e2) => typeof e2 == "boolean", jt = (e2) => Ft(e2) ? String(e2) : e2, It = (e2, t2) => Object.entries(e2).every(([s2, n2]) => t2[s2] === n2);
function Dt(e2) {
  return (t2, s2) => {
    const n2 = Object.entries(t2).reduce((f, [d, h]) => h === void 0 ? f : {
      ...f,
      [d]: h
    }, {}), o2 = {
      ...e2.defaultVariants,
      ...n2
    }, l = Object.keys(e2.variants).map((f) => e2.variants[f][jt(t2[f]) || e2.defaultVariants[f]]), c = e2.compoundVariants.reduce((f, {
      classes: d,
      ...h
    }) => (It(h, o2) && d && f.push(d), f), []);
    return $t([e2.base, l, c, s2]);
  };
}
const Vt = Dt({
  base: "w-auto h-auto text-white text-center bg-gradient-to-br from-primary-800 to-primary-900 border-2 rounded-full shadow-md align-middle hover:bg-gray-800 hover:cursor-pointer",
  variants: {
    variant: {
      buy: "border-green-500 hover:border-green-400",
      sell: "border-red-500 hover:border-red-400",
      basic: "border-primary-600 hover:border-primary-400",
      default: "border-brand hover:border-accent-400"
    },
    size: {
      xs: "py-1 px-2 text-xs",
      sm: "py-2 px-4 text-sm",
      md: "py-3 px-6",
      lg: "py-4 px-8 text-lg"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  },
  compoundVariants: []
});
function qe({
  className: e2,
  children: t2,
  variant: s2,
  size: n2,
  element: o2,
  onClick: l,
  disabled: c
}) {
  const f = Vt({
    size: n2,
    variant: s2
  }, e2), h = (() => {
    switch (o2) {
      case "disclosure":
        return Oe.Button;
      case "menu":
        return qe$1.Button;
      case "popover":
        return mt$1.Button;
      case "listbox":
        return pt$1.Button;
      default:
        return "div";
    }
  })();
  return /* @__PURE__ */ a(h, {
    disabled: c,
    onClick: l,
    className: f,
    children: t2
  });
}
function Nn() {
  var y;
  const {
    removeNotification: e2,
    notifications: t2
  } = Lt(), s2 = react.exports.useRef(t2[0]), n2 = useAnimationControls(), [o2, l] = react.exports.useState(t2[0]), c = "flex items-start absolute bottom-8 right-8 bg-primary-800 w-[400px] h-auto p-4 text-cyan-700 z-50 opacity-0 border-l-4", f = {
    [L.basic]: " border-l-secondary-400",
    [L.error]: " border-l-red-400",
    [L.success]: " border-l-green-400",
    [L.info]: " border-l-secondary-400",
    [L.warning]: " border-l-orange-400"
  }, d = {
    duration: 0.3,
    ease: "easeInOut"
  }, h = react.exports.useRef(false);
  react.exports.useEffect(() => (h.current = true, () => {
    h.current = false;
  }), []), react.exports.useEffect(() => {
    o2 && n2.start({
      opacity: 1,
      x: [200, 0],
      transition: d
    });
  }, [o2]), react.exports.useEffect(() => {
    var v;
    if (t2.length && JSON.stringify(s2.current) !== JSON.stringify(t2[0])) {
      const C = t2[0];
      l(C), s2.current = C;
      const O = setTimeout(async () => {
        await n2.start({
          opacity: [1, 0],
          x: [0, 200],
          transition: d
        }), e2(C), l(void 0);
      }, (v = C.dismissAfter) != null ? v : 3e3);
      return () => {
        n2.stop(), h.current || clearTimeout(O);
      };
    }
  }, [t2, e2, n2]);
  const m = react.exports.useCallback(async (v) => {
    v.preventDefault(), o2 && (e2(o2), await n2.start({
      opacity: [1, 0],
      x: [0, 200],
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }), l(void 0));
  }, [n2, e2, o2]);
  return /* @__PURE__ */ g(motion.div, {
    className: c + ((o2 == null ? void 0 : o2.type) != null ? f[o2 == null ? void 0 : o2.type] : f.info),
    animate: n2,
    children: [(o2 == null ? void 0 : o2.type) === L.error ? /* @__PURE__ */ a(sr, {
      className: "w-10 h-10 text-red-400"
    }) : (o2 == null ? void 0 : o2.type) === L.success ? /* @__PURE__ */ a(tr, {
      className: "w-10 h-10 text-green-400"
    }) : (o2 == null ? void 0 : o2.type) === L.warning ? /* @__PURE__ */ a(nr, {
      className: "w-10 h-10 text-orange-400"
    }) : (o2 == null ? void 0 : o2.type) === L.info ? /* @__PURE__ */ a(ar, {
      className: "w-10 h-10 text-secondary-400"
    }) : null, /* @__PURE__ */ g("div", {
      className: "flex flex-col ml-3 w-full",
      children: [/* @__PURE__ */ g("div", {
        className: "flex items-center justify-between text-lg font-semibold",
        children: [/* @__PURE__ */ a("div", {
          className: "mr-auto",
          children: o2 == null ? void 0 : o2.title
        }), /* @__PURE__ */ a(qe, {
          size: "xs",
          variant: "basic",
          className: "border-0 bg-none",
          onClick: m,
          children: /* @__PURE__ */ a(Rt, {
            className: "w-4 h-4"
          })
        })]
      }), /* @__PURE__ */ a("div", {
        className: "text-white",
        children: o2 == null ? void 0 : o2.message
      }), /* @__PURE__ */ a("div", {
        children: (y = o2 == null ? void 0 : o2.actions) == null ? void 0 : y.map((v, C) => /* @__PURE__ */ a(qe, {
          ...v
        }, C))
      })]
    })]
  });
}
function _n({
  children: e2,
  className: t2,
  id: s2
}) {
  const n2 = `font-semibold text-lg text-white ${t2}`;
  return /* @__PURE__ */ a("div", {
    id: s2,
    className: n2,
    children: e2
  });
}
function ie({
  children: e2,
  className: t2,
  htmlFor: s2
}) {
  const n2 = `font-bold text-xs text-primary-400 uppercase mb-1 ${t2}`, l = (() => s2 ? "label" : "div")();
  return /* @__PURE__ */ a(l, {
    htmlFor: s2,
    className: n2,
    children: e2
  });
}
const At = ({
  size: e2
}) => /* @__PURE__ */ g("svg", {
  width: e2,
  height: e2,
  baseProfile: "tiny",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 112 112",
  xmlSpace: "preserve",
  children: [/* @__PURE__ */ a("circle", {
    fill: "#FFFFFF",
    cx: "56",
    cy: "56",
    r: "56"
  }), /* @__PURE__ */ a("path", {
    fill: "black",
    d: "M86.6 37.4h-9.9c-1.1 0-2.2-.5-3-1.3l-4-4.5c-1.2-1.3-3.1-1.4-4.5-.3l-.3.3-3.4 3.9c-1.1 1.3-2.8 2-4.5 2H2.9C1.4 41.9.4 46.6 0 51.3h51.2c.9 0 1.8-.4 2.4-1l4.8-5c.6-.6 1.4-1 2.3-1h.2c.9 0 1.8.4 2.4 1.1l4 4.5c.8.9 1.9 1.4 3 1.4H112c-.4-4.7-1.4-9.4-2.9-13.8H86.6zM53.8 65l-4-4.5c-1.2-1.3-3.1-1.4-4.5-.3l-.3.3-3.5 3.9c-1.1 1.3-2.7 2-4.4 2H.8c.9 4.8 2.5 9.5 4.6 14h25.5c.9 0 1.7-.4 2.4-1l4.8-5c.6-.6 1.4-1 2.3-1h.2c.9 0 1.8.4 2.4 1.1l4 4.5c.8.9 1.9 1.4 3 1.4h56.6c2.1-4.4 3.7-9.1 4.6-14H56.8c-1.2 0-2.3-.5-3-1.4zm19.6-43.6 4.8-5c.6-.6 1.4-1 2.3-1h.2c.9 0 1.8.4 2.4 1l4 4.5c.8.9 1.9 1.3 3 1.3h10.8c-18.8-24.8-54.1-29.7-79-11-4.1 3.1-7.8 6.8-11 11H71c1 .2 1.8-.2 2.4-.8zM34.7 94.2c-1.2 0-2.3-.5-3-1.3l-4-4.5c-1.2-1.3-3.2-1.4-4.5-.2l-.2.2-3.5 3.9c-1.1 1.3-2.7 2-4.4 2h-.2C36 116.9 71.7 118 94.4 96.7c.9-.8 1.7-1.7 2.6-2.6H34.7z"
  })]
}), zt = ({
  size: e2
}) => /* @__PURE__ */ a("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  height: e2,
  width: e2,
  children: /* @__PURE__ */ g("g", {
    fill: "none",
    fillRule: "evenodd",
    children: [/* @__PURE__ */ a("circle", {
      cx: "16",
      cy: "16",
      r: "16",
      fill: "#F7931A"
    }), /* @__PURE__ */ a("path", {
      fill: "#FFF",
      fillRule: "nonzero",
      d: "M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
    })]
  })
}), Bt = ({
  size: e2
}) => /* @__PURE__ */ a("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  width: e2,
  height: e2,
  children: /* @__PURE__ */ g("g", {
    fill: "none",
    fillRule: "evenodd",
    children: [/* @__PURE__ */ a("circle", {
      cx: "16",
      cy: "16",
      r: "16",
      fill: "#627EEA"
    }), /* @__PURE__ */ g("g", {
      fill: "#FFF",
      fillRule: "nonzero",
      children: [/* @__PURE__ */ a("path", {
        fillOpacity: ".602",
        d: "M16.498 4v8.87l7.497 3.35z"
      }), /* @__PURE__ */ a("path", {
        d: "M16.498 4L9 16.22l7.498-3.35z"
      }), /* @__PURE__ */ a("path", {
        fillOpacity: ".602",
        d: "M16.498 21.968v6.027L24 17.616z"
      }), /* @__PURE__ */ a("path", {
        d: "M16.498 27.995v-6.028L9 17.616z"
      }), /* @__PURE__ */ a("path", {
        fillOpacity: ".2",
        d: "M16.498 20.573l7.497-4.353-7.497-3.348z"
      }), /* @__PURE__ */ a("path", {
        fillOpacity: ".602",
        d: "M9 16.22l7.498 4.353v-7.701z"
      })]
    })]
  })
}), Ut = ({
  size: e2
}) => /* @__PURE__ */ a("svg", {
  width: e2,
  height: e2,
  viewBox: "0 0 32 32",
  xmlns: "http://www.w3.org/2000/svg",
  children: /* @__PURE__ */ g("g", {
    fill: "none",
    children: [/* @__PURE__ */ a("circle", {
      fill: "#66F9A1",
      cx: "16",
      cy: "16",
      r: "16"
    }), /* @__PURE__ */ a("path", {
      d: "M9.925 19.687a.59.59 0 01.415-.17h14.366a.29.29 0 01.207.497l-2.838 2.815a.59.59 0 01-.415.171H7.294a.291.291 0 01-.207-.498l2.838-2.815zm0-10.517A.59.59 0 0110.34 9h14.366c.261 0 .392.314.207.498l-2.838 2.815a.59.59 0 01-.415.17H7.294a.291.291 0 01-.207-.497L9.925 9.17zm12.15 5.225a.59.59 0 00-.415-.17H7.294a.291.291 0 00-.207.498l2.838 2.815c.11.109.26.17.415.17h14.366a.291.291 0 00.207-.498l-2.838-2.815z",
      fill: "#FFF"
    })]
  })
}), Wt = ({
  size: e2
}) => /* @__PURE__ */ a("svg", {
  width: e2,
  height: e2,
  viewBox: "0 0 32 32",
  xmlns: "http://www.w3.org/2000/svg",
  children: /* @__PURE__ */ g("g", {
    fill: "none",
    children: [/* @__PURE__ */ a("circle", {
      fill: "#3E73C4",
      cx: "16",
      cy: "16",
      r: "16"
    }), /* @__PURE__ */ g("g", {
      fill: "#FFF",
      children: [/* @__PURE__ */ a("path", {
        d: "M20.022 18.124c0-2.124-1.28-2.852-3.84-3.156-1.828-.243-2.193-.728-2.193-1.578 0-.85.61-1.396 1.828-1.396 1.097 0 1.707.364 2.011 1.275a.458.458 0 00.427.303h.975a.416.416 0 00.427-.425v-.06a3.04 3.04 0 00-2.743-2.489V9.142c0-.243-.183-.425-.487-.486h-.915c-.243 0-.426.182-.487.486v1.396c-1.829.242-2.986 1.456-2.986 2.974 0 2.002 1.218 2.791 3.778 3.095 1.707.303 2.255.668 2.255 1.639 0 .97-.853 1.638-2.011 1.638-1.585 0-2.133-.667-2.316-1.578-.06-.242-.244-.364-.427-.364h-1.036a.416.416 0 00-.426.425v.06c.243 1.518 1.219 2.61 3.23 2.914v1.457c0 .242.183.425.487.485h.915c.243 0 .426-.182.487-.485V21.34c1.829-.303 3.047-1.578 3.047-3.217z"
      }), /* @__PURE__ */ a("path", {
        d: "M12.892 24.497c-4.754-1.7-7.192-6.98-5.424-11.653.914-2.55 2.925-4.491 5.424-5.402.244-.121.365-.303.365-.607v-.85c0-.242-.121-.424-.365-.485-.061 0-.183 0-.244.06a10.895 10.895 0 00-7.13 13.717c1.096 3.4 3.717 6.01 7.13 7.102.244.121.488 0 .548-.243.061-.06.061-.122.061-.243v-.85c0-.182-.182-.424-.365-.546zm6.46-18.936c-.244-.122-.488 0-.548.242-.061.061-.061.122-.061.243v.85c0 .243.182.485.365.607 4.754 1.7 7.192 6.98 5.424 11.653-.914 2.55-2.925 4.491-5.424 5.402-.244.121-.365.303-.365.607v.85c0 .242.121.424.365.485.061 0 .183 0 .244-.06a10.895 10.895 0 007.13-13.717c-1.096-3.46-3.778-6.07-7.13-7.162z"
      })]
    })]
  })
}), Ht = ({
  size: e2
}) => /* @__PURE__ */ a("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  width: e2,
  height: e2,
  children: /* @__PURE__ */ g("g", {
    fill: "none",
    fillRule: "evenodd",
    children: [/* @__PURE__ */ a("circle", {
      cx: "16",
      cy: "16",
      r: "16",
      fill: "#26A17B"
    }), /* @__PURE__ */ a("path", {
      fill: "#FFF",
      d: "M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117"
    })]
  })
}), Yt = ({
  size: e2
}) => /* @__PURE__ */ g("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  height: e2,
  width: e2,
  children: [/* @__PURE__ */ a("circle", {
    cx: "16",
    cy: "16",
    r: "16",
    fill: "#00aeef"
  }), /* @__PURE__ */ a("path", {
    d: "M13,18c.0002431,.0002387,5.9999166-.0003275,6,0l1.9313197,6.759619c.0377742,.1322095,.1811803,.240381,.3186803,.240381h5.5c.1375,0,.2213695-.1087959,.1863767-.2417686L22.0636233,6.2417686c-.0349928-.1329727-.1761233-.2417686-.3136233-.2417686H10.25c-.1375,0-.2786305,.1087959-.3136233,.2417686L5.0636233,24.7582314c-.0349928,.1329727,.0488767,.2417686,.1863767,.2417686h5.5c.1375,0,.2809061-.1081714,.3186803-.240381l1.9313197-6.759619m-.75-4c-.1375,0-.2279369-.1103153-.200971-.2451452l.7019419-3.5097097c.026966-.1348298,.161529-.2451452,.299029-.2451452h5.9c.1375,0,.2720631,.1103153,.299029,.2451452l.7019419,3.5097097c.026966,.1348298-.063471,.2451452-.200971,.2451452h-7.5Z",
    fill: "#1e293b"
  }), /* @__PURE__ */ a("path", {
    d: "M26.1893661,14.7574644c.0333486,.1333946-.0518661,.2425356-.1893661,.2425356h-1c-.1375,0-.2772853-.109141-.3106339-.2425356l-.8787322-3.5149287c-.0333486-.1333946,.0518661-.2425356,.1893661-.2425356h1c.1375,0,.2772853,.109141,.3106339,.2425356l.8787322,3.5149287Z",
    fill: "#1e293b"
  }), /* @__PURE__ */ a("path", {
    d: "M7.3106339,14.7574644c-.0333486,.1333946-.1731339,.2425356-.3106339,.2425356h-1c-.1375,0-.2227147-.109141-.1893661-.2425356l.8787322-3.5149287c.0333486-.1333946,.1731339-.2425356,.3106339-.2425356h1c.1375,0,.2227147,.109141,.1893661,.2425356l-.8787322,3.5149287Z",
    fill: "#1e293b"
  }), /* @__PURE__ */ a("rect", {
    x: "15.5",
    y: "3.9999997",
    width: "1",
    height: "2",
    fill: "#1e293b",
    opacity: ".5"
  }), /* @__PURE__ */ a("rect", {
    x: "14.0000005",
    y: "3",
    width: "3.9999953",
    height: "1",
    rx: ".4999994",
    ry: ".4999994",
    fill: "#1e293b"
  })]
}), Zt = ({
  size: e2
}) => /* @__PURE__ */ a("svg", {
  width: e2,
  height: e2,
  viewBox: "0 0 63 73",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  children: /* @__PURE__ */ a("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M6.11332 6.48954L0.138184 12.4646V36.4164V60.3682L0.485239 60.7262C1.03021 61.2884 11.7606 72.2164 11.9221 72.3737L12.0665 72.5144H31.2646H50.4627L50.7907 72.1861C50.971 72.0056 53.3941 69.5194 56.1753 66.6614C58.9565 63.8033 61.4657 61.2272 61.7513 60.9367L62.2705 60.4085V36.4188V12.429L60.7793 10.9272C59.959 10.1011 58.3169 8.44604 57.13 7.24916C55.9431 6.05229 53.9524 4.04736 52.7062 2.79372L50.4404 0.514404H31.2644H12.0884L6.11332 6.48954ZM50.2943 12.4906C50.3781 12.5744 50.3576 32.8289 50.2737 32.9011C50.2196 32.9476 34.5884 35.006 34.001 35.044C33.7622 35.0594 33.8433 34.9485 39.3589 27.7213C45.5808 19.5686 44.9754 20.395 44.8148 20.2755C44.6063 20.1204 38.6034 16.6478 38.5439 16.6478C38.464 16.6478 38.7411 15.9955 34.934 25.1435C31.7749 32.7342 31.3714 33.6736 31.3001 33.6023C31.2888 33.591 29.6956 29.7759 27.7595 25.1242C24.4379 17.1436 24.2342 16.6666 24.1481 16.6674C24.052 16.6684 17.9013 20.2175 17.8184 20.3199C17.7499 20.4045 17.3428 19.859 23.3232 27.6953C28.8065 34.8802 28.9372 35.0585 28.7079 35.0442C28.1386 35.0088 12.1893 32.9101 12.1351 32.8635C12.0511 32.7914 12.0306 12.5744 12.1144 12.4906C12.1801 12.425 50.2287 12.425 50.2943 12.4906ZM28.819 37.9777C28.8175 38.0189 26.3544 41.2775 23.3456 45.2189C17.3102 53.1249 17.763 52.5237 17.7909 52.5956C17.8214 52.674 24.1086 56.3158 24.1716 56.2916C24.2508 56.2612 24.1062 56.6028 27.8263 47.6577C31.4452 38.9558 31.3347 39.2058 31.4537 39.4597C31.4778 39.5113 33.0283 43.2342 34.8992 47.7327C38.7291 56.942 38.4592 56.306 38.5373 56.306C38.587 56.306 44.348 52.9837 44.7621 52.7163C44.9793 52.576 45.253 52.9551 39.3718 45.2491C36.3448 41.2829 33.8683 38.0127 33.8683 37.9819C33.8683 37.951 33.8826 37.9169 33.9002 37.9061C33.9178 37.8952 37.5773 38.3585 42.0325 38.9356C46.4878 39.5127 50.1529 39.9849 50.1772 39.9849C50.2015 39.9849 50.2479 40.0115 50.2804 40.0439C50.3584 40.1219 50.3722 60.4603 50.2943 60.5382C50.2287 60.6038 12.1801 60.6038 12.1144 60.5382C12.0472 60.4709 12.049 40.1227 12.1163 40.07C12.278 39.9434 28.8231 37.8708 28.819 37.9777Z",
    fill: "#FF007A"
  })
}), Kt = ({
  size: e2
}) => /* @__PURE__ */ g("svg", {
  width: e2,
  height: e2,
  viewBox: "0 0 510 510",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  children: [/* @__PURE__ */ a("circle", {
    x: "0.816406",
    y: "0.0366211",
    width: "509",
    height: "509.927",
    fill: "black"
  }), /* @__PURE__ */ a("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M304.903 59.8335C304.669 60.0192 303.691 61.4258 302.728 62.9593C292.436 79.3562 265.475 115.573 255.731 126.091C255.212 126.651 254.982 126.415 249.356 119.557C233.063 99.697 218.323 79.6886 208.226 63.726C205.147 58.8583 205.873 58.4236 180.902 80.0814C148.214 108.432 148.911 107.548 155.809 111.88C166.925 118.861 178.223 126.717 191.076 136.402C204.146 146.251 223.281 161.764 223.281 162.512C223.281 164.346 164.951 222.577 163.113 222.577C162.54 222.577 157.691 216.865 148.676 205.57C133.622 186.709 121.877 170.342 111.963 154.408C109.111 149.826 108.845 149.487 108.261 149.711C107.894 149.852 98.5034 159.945 91.957 167.233C63.0165 199.456 59.3262 204.506 63.0215 206.833C80.4551 217.813 108.324 238.491 124.931 252.769C127.395 254.887 127.728 254.334 120.331 260.398C99.7553 277.266 79.0772 292.423 61.8151 303.292C60.8409 303.905 60.007 304.601 59.9621 304.837C59.7382 306.016 91.3208 342.477 105.838 357.799C108.58 360.693 108.343 360.773 111.282 355.966C122.203 338.104 139.222 314.921 158.293 291.93C163.836 285.248 161.318 283.538 193.882 316.102C226.192 348.412 224.583 346.116 218.471 351.195C195.678 370.137 173.576 386.417 155.015 397.936C152.202 399.682 149.827 401.299 149.739 401.529C149.161 403.037 203.416 450.8 205.011 450.188C205.229 450.104 206.254 448.698 207.29 447.063C217.014 431.709 229.397 414.598 243.742 396.693C249 390.129 254.657 383.283 254.993 383.075C255.388 382.832 255.64 383.103 260.409 388.886C276.265 408.117 293.038 430.85 302.323 445.693C303.25 447.175 303.844 447.854 304.213 447.854C306.241 447.854 358.95 401.466 358.438 400.132C358.348 399.899 356.413 398.535 354.137 397.102C335.604 385.431 314.034 369.503 292.495 351.584C286.4 346.513 286.715 347.014 288.434 345.142C305.293 326.782 345.735 286.703 347.404 286.703C347.679 286.703 350.01 289.285 353.004 292.906C371.024 314.705 386.987 336.382 397.813 353.756C400.53 358.116 400.791 358.444 401.311 358.129C402.639 357.327 422.978 334.854 433.531 322.53C451.518 301.523 450.659 304.682 440.263 297.772C422.869 286.212 398.702 268.003 385.338 256.386C383.116 254.455 382.841 254.993 388.405 250.371C407.967 234.119 428.585 218.866 446.031 207.74C450.757 204.726 451.04 204.455 450.422 203.533C449.294 201.849 437.614 187.896 429.618 178.68C420.699 168.402 403.618 149.695 402.663 149.161C402.035 148.809 401.908 148.974 398.161 154.966C388.713 170.077 376.168 187.546 362.195 205.051C355.293 213.697 347.708 222.856 347.451 222.856C345.787 222.856 287.128 164.137 287.128 162.471C287.128 161.757 308.468 144.555 321.56 134.714C333.446 125.781 350.297 114.298 358.569 109.496C361.173 107.984 361.21 107.672 359.029 105.654C334.012 82.5093 306.1 58.8809 304.903 59.8335ZM261.533 134.125C267.441 141.003 278.114 153.046 283.462 158.869C287.014 162.736 287.248 162.002 280.645 167.677C274.187 173.227 264.048 182.206 259.036 186.815C254.951 190.57 255.514 190.51 252.268 187.542C246.922 182.654 234.397 171.567 229.332 167.238C223.048 161.867 222.98 163.309 229.875 155.732C235.659 149.377 246.195 137.403 251.833 130.779C255.588 126.367 254.565 126.014 261.533 134.125ZM263.07 197.617C272.393 206.31 302.476 236.349 310.823 245.3C314.255 248.98 317.625 252.581 318.312 253.302L319.562 254.614L317.076 257.324C303.785 271.819 278.692 297.049 262.521 312.178C258.572 315.873 255.373 318.983 255.412 319.089C255.579 319.541 272.02 334.231 280.785 341.76C287.403 347.445 287.384 346.135 280.954 353.198C274.656 360.118 265.747 370.225 259.943 377.037C255.576 382.16 255.364 382.38 255.01 382.16C254.888 382.085 252.188 378.988 249.011 375.278C243.154 368.441 232.482 356.402 227.089 350.55C223.474 346.627 223.465 347.055 227.235 343.856C235.907 336.497 255.065 319.415 255.065 319.041C255.065 318.942 251.332 315.361 246.77 311.083C242.208 306.805 231.565 296.402 223.12 287.964C209.161 274.019 204.122 268.834 194.18 258.185L190.87 254.64L194.459 250.815C213.053 231.001 230.406 213.631 250.883 194.337C255.76 189.741 254.161 189.31 263.07 197.617ZM168.102 229.059C173.294 235.101 181.87 244.793 187.318 250.775C191.249 255.092 191.082 254.456 188.902 256.795C183.977 262.084 170.908 276.864 165.479 283.288C162.92 286.315 163.144 286.256 161.145 284.425C152.644 276.629 140.691 266.041 132.459 259.011C126.654 254.054 126.402 255.482 134.271 248.748C141.427 242.623 153.553 231.868 159.155 226.676C163.449 222.696 162.391 222.415 168.102 229.059ZM350.975 226.386C356.648 231.614 368.764 242.357 375.874 248.465C379.679 251.732 382.752 254.558 382.705 254.745C382.658 254.931 379.42 257.83 375.51 261.187C368.027 267.611 359.316 275.321 352.09 281.918C346.834 286.717 348.198 287.035 341.728 279.506C335.885 272.708 328.745 264.648 323.171 258.556C321.284 256.494 319.773 254.713 319.813 254.6C319.854 254.487 322.477 251.533 325.641 248.035C331.996 241.012 340.548 231.282 344.566 226.506C347.695 222.785 347.08 222.797 350.975 226.386Z",
    fill: "white"
  })]
});
function Xt({
  symbol: e2,
  size: t2
}) {
  switch (e2) {
    case "apt":
      return /* @__PURE__ */ a(At, {
        size: t2
      });
    case "btc":
      return /* @__PURE__ */ a(zt, {
        size: t2
      });
    case "eth":
      return /* @__PURE__ */ a(Bt, {
        size: t2
      });
    case "sol":
      return /* @__PURE__ */ a(Ut, {
        size: t2
      });
    case "usdt":
      return /* @__PURE__ */ a(Ht, {
        size: t2
      });
    case "usdc":
      return /* @__PURE__ */ a(Wt, {
        size: t2
      });
    case "aux":
      return /* @__PURE__ */ a(Yt, {
        size: t2
      });
    case "martian":
      return /* @__PURE__ */ a(Kt, {
        size: t2
      });
    case "tapt":
      return /* @__PURE__ */ a(Zt, {
        size: t2
      });
    default:
      return null;
  }
}
function Jt({
  coin: e2,
  size: t2
}) {
  return e2 ? /* @__PURE__ */ a(Xt, {
    symbol: e2 == null ? void 0 : e2.toLowerCase(),
    size: t2 != null ? t2 : 32
  }) : null;
}
function Tn({
  coins: e2,
  size: t2 = 32
}) {
  return /* @__PURE__ */ a("div", {
    className: "flex items-center -space-x-2",
    children: e2.map((s2, n2) => /* @__PURE__ */ a("div", {
      className: "inline-block rounded-full drop-shadow-lg ring-2 ring-primary-200",
      children: /* @__PURE__ */ a(Jt, {
        coin: s2,
        size: t2
      }, `avatar-${s2}-${n2}`)
    }))
  });
}
function Mn({
  children: e2,
  className: t2,
  variant: s2,
  size: n2,
  onClick: o2
}) {
  const l = () => {
    switch (s2) {
      case "success":
        return "bg-green-300 text-green-900";
      case "warning":
        return "bg-yellow-300 text-yellow-900";
      case "error":
        return "bg-red-300 text-red-900";
      case "basic":
        return "bg-secondary-300 text-secondary-800";
      case "dark":
        return "bg-gray-700 text-gray-300";
      default:
        return "bg-secondary-200 text-secondary-800";
    }
  }, c = () => {
    switch (n2) {
      case "xs":
        return "py-1 px-2 text-xs";
      case "sm":
        return "py-0.5 px-1 text-sm";
      case "md":
        return "py-1 px-2 text-md";
      case "lg":
        return "py-1.5 px-3 text-lg";
      default:
        return "py-1 px-2 text-md";
    }
  }, d = (() => {
    const h = "font-semibold rounded shadow-sm", m = c(), y = l();
    return `${h} ${m} ${y} ${t2 != null ? t2 : ""}`;
  })();
  return /* @__PURE__ */ a("span", {
    onClick: o2,
    className: d,
    children: e2
  });
}
function qt({
  valueChange: e2,
  percentChange: t2,
  priceDirection: s2
}) {
  const o2 = (() => {
    const l = "inline-flex items-center font-bold text-xs";
    return s2 && s2 === "up" ? `${l} text-green-400` : s2 && s2 === "down" ? `${l} text-red-400` : `${l} text-primary-400`;
  })();
  return /* @__PURE__ */ g("div", {
    className: o2,
    children: [s2 && s2 === "up" ? /* @__PURE__ */ a(it, {
      className: "w-[14px] h-[14px] mr-1"
    }) : s2 && s2 === "down" ? /* @__PURE__ */ a(at, {
      className: "w-[14px] h-[14px] mr-1"
    }) : null, t2 && /* @__PURE__ */ g("div", {
      className: "mr-2",
      children: [t2, "%"]
    }), e2 && /* @__PURE__ */ a("div", {
      children: e2
    })]
  });
}
function Pn({
  title: e2,
  value: t2,
  valueChange: s2,
  percentChange: n2,
  priceDirection: o2,
  variant: l,
  className: c,
  onClick: f
}) {
  const d = () => {
    switch (l) {
      case "card":
        return "bg-gray-800 shadow-md";
      case "basic":
        return "border-2 border-primary-800";
      default:
        return "";
    }
  }, m = (() => {
    const y = "p-3 rounded-lg", v = d();
    return `${y} ${v} ${c != null ? c : ""}`;
  })();
  return /* @__PURE__ */ g("div", {
    className: m,
    onClick: f,
    children: [/* @__PURE__ */ a(ie, {
      children: e2
    }), /* @__PURE__ */ a("div", {
      className: "text-2xl",
      children: t2
    }), n2 || s2 ? /* @__PURE__ */ a(qt, {
      percentChange: n2,
      valueChange: s2,
      priceDirection: o2
    }) : null]
  });
}
function Gt(...e2) {
  return e2.filter(Boolean).join(" ");
}
function Ln({
  options: e2,
  onChange: t2,
  label: s2,
  value: n2,
  className: o2
}) {
  const [l, c] = react.exports.useState(n2), f = react.exports.useCallback((d) => {
    t2 == null || t2(d.value), c(d);
  }, [t2]);
  return /* @__PURE__ */ a(pt$1, {
    value: l,
    onChange: f,
    children: ({
      open: d
    }) => /* @__PURE__ */ a(oe, {
      children: /* @__PURE__ */ g("div", {
        className: `relative mt-1 w-56 ${o2}`,
        children: [s2 && /* @__PURE__ */ a(ie, {
          className: "block",
          children: "label"
        }), /* @__PURE__ */ g(pt$1.Button, {
          className: " text-white relative w-full h-[46px] cursor-default rounded-md bg-primary-800 py-2 pl-3 pr-10 text-left truncate outline-none border border-transparent focus:border-brand focus-visible:border-brand hover:cursor-pointer sm:text-sm",
          children: [l.label, /* @__PURE__ */ a("span", {
            className: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3",
            children: d ? /* @__PURE__ */ a(pt, {
              className: "h-4 w-4 text-primary-400",
              "aria-hidden": "true"
            }) : /* @__PURE__ */ a(ft, {
              className: "h-4 w-4 text-primary-400",
              "aria-hidden": "true"
            })
          })]
        }), /* @__PURE__ */ a(pt$1.Options, {
          className: " absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-primary-700 py-1 text-white shadow-lg ring-1 border-none ring-black ring-opacity-5 outline-none sm:text-sm ",
          children: e2.map((h) => /* @__PURE__ */ a(pt$1.Option, {
            value: h,
            className: ({
              active: m
            }) => Gt(m ? "text-white bg-secondary-600" : "text-white", "relative cursor-pointer select-none py-2 pl-3 pr-9"),
            children: h.label
          }, h.label))
        })]
      })
    })
  });
}
function $n({
  value: e2,
  onChange: t2,
  name: s2,
  placeholder: n2 = "0.00",
  label: o2,
  prefix: l,
  suffix: c,
  className: f,
  inputClass: d,
  autoFocus: h = false,
  ...m
}) {
  const v = (() => `bg-primary-800 p-3 block w-full rounded-md outline-none border border-transparent focus:border-brand focus-visible:border-brand sm:text-sm ${l ? "pl-7" : ""} ${c ? "pr-12" : ""} ${d}`)();
  return /* @__PURE__ */ g("div", {
    className: f,
    children: [o2 && /* @__PURE__ */ a(ie, {
      htmlFor: s2,
      children: o2
    }), /* @__PURE__ */ g("div", {
      className: "relative rounded-md shadow-sm ",
      children: [/* @__PURE__ */ a("div", {
        className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
        children: l
      }), /* @__PURE__ */ a("input", {
        autoFocus: h,
        name: s2,
        id: s2,
        value: e2,
        placeholder: n2,
        onChange: t2,
        className: v,
        ...m
      }), /* @__PURE__ */ a("div", {
        className: "absolute inset-y-0 right-3 flex items-center text-gray-300",
        children: c
      })]
    })]
  });
}
function Fn({
  enabled: e2,
  onChange: t2
}) {
  return /* @__PURE__ */ a(be, {
    checked: e2,
    onChange: t2,
    className: `${e2 ? "bg-green-600" : "bg-accent-900"}
        relative 
        inline-flex 
        h-[24px] 
        w-[48px] 
        shrink-0 
        cursor-pointer 
        rounded-full 
        border-2 
        border-transparent 
        transition-colors 
        duration-200 
        ease-in-out 
        focus:outline-none 
        focus-visible:ring-2  
        focus-visible:ring-white
        focus-visible:ring-opacity-75`,
    children: /* @__PURE__ */ a("span", {
      "aria-hidden": "true",
      className: `
          ${e2 ? "translate-x-[23px]" : "translate-x-0"}
          pointer-events-none 
          inline-block 
          h-[20px] 
          w-[20px] 
          transform 
          rounded-full
          bg-white 
          shadow-lg 
          ring-0 
          transition 
          duration-200 
          ease-in-out`
    })
  });
}
function jn({
  tabs: e2
}) {
  const t2 = (n2) => n2 === "buy" ? "border-b-green-500 text-green-400" : n2 === "sell" ? "border-b-red-500 text-red-400" : "border-b-secondary-500 text-secondary-400", s2 = (n2, o2) => {
    const l = "w-full py-2.5 text-sm font-semibold leading-5 border-b-2 border-primary-700 outline-none rounded-t-2xl";
    if (n2) {
      const c = t2(o2);
      return `${l} ${c}`;
    } else
      return `${l} text-primary-300 hover:bg-white/[0.05]`;
  };
  return /* @__PURE__ */ a(Ge$1.List, {
    className: "flex",
    children: e2.map((n2) => /* @__PURE__ */ a(Ge$1, {
      className: ({
        selected: o2
      }) => s2(o2, n2.variant),
      onClick: n2.onClick,
      children: n2.label
    }, n2.label))
  });
}
function In({
  max: e2,
  min: t2,
  value: s2,
  onChange: n2
}) {
  return /* @__PURE__ */ a("div", {
    className: "Slider-root",
    children: /* @__PURE__ */ a(Slider, {
      dotStyle: {},
      railStyle: {
        backgroundColor: "dodgersecondary"
      },
      trackStyle: {
        backgroundColor: "rgba(255,255,255,0.5)"
      },
      handleStyle: {
        height: 25,
        width: 25,
        top: 0
      },
      activeDotStyle: {},
      value: s2,
      max: e2,
      min: t2,
      onChange: n2
    })
  });
}
const Dn = ({
  children: e2,
  className: t2,
  id: s2,
  padding: n2,
  loading: o2,
  error: l,
  onClick: c
}) => /* @__PURE__ */ a(oe, {
  children: o2 ? /* @__PURE__ */ a(ir, {
    variant: "card"
  }) : l ? /* @__PURE__ */ a(or, {
    title: "Error",
    message: "Uh Oh. Please try again.",
    variant: "error",
    details: l
  }) : /* @__PURE__ */ a("div", {
    onClick: c,
    id: s2,
    className: `rounded-2xl bg-primary-900 p-${n2 != null ? n2 : 6} shadow-md ${t2 != null ? t2 : ""}`,
    children: e2
  })
});
const Vn = react.exports.forwardRef(function({
  children: t2,
  trigger: s2
}, n2) {
  const [o2, l] = react.exports.useState(false), c = react.exports.useRef(null);
  return react.exports.useImperativeHandle(n2, () => ({
    isOpen: o2,
    openModal() {
      l(true);
    },
    closeModal() {
      l(false);
    }
  }), [o2]), /* @__PURE__ */ g(oe, {
    children: [s2 ? /* @__PURE__ */ a("div", {
      onClick: () => l(true),
      children: s2
    }) : null, /* @__PURE__ */ a(We.Root, {
      show: o2,
      as: react.exports.Fragment,
      children: /* @__PURE__ */ g(gt$1, {
        as: "div",
        className: "relative z-10",
        initialFocus: c,
        onClose: l,
        children: [/* @__PURE__ */ a(We.Child, {
          as: react.exports.Fragment,
          enter: "ease-out duration-300",
          enterFrom: "opacity-0",
          enterTo: "opacity-100",
          leave: "ease-in duration-200",
          leaveFrom: "opacity-100",
          leaveTo: "opacity-0",
          children: /* @__PURE__ */ a("div", {
            className: "fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          })
        }), /* @__PURE__ */ a("div", {
          className: "fixed inset-0 z-10 overflow-y-auto",
          children: /* @__PURE__ */ a("div", {
            className: "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0",
            children: /* @__PURE__ */ a(We.Child, {
              as: react.exports.Fragment,
              enter: "ease-out duration-300",
              enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
              enterTo: "opacity-100 translate-y-0 sm:scale-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
              leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
              children: /* @__PURE__ */ a(gt$1.Panel, {
                className: "relative transform overflow-hidden bg-transparent text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg md:max-w-4xl",
                children: t2
              })
            })
          })
        })]
      })
    })]
  });
});
/**
 * react-virtual
 *
 * Copyright (c) TanStack
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
/**
 * virtual-core
 *
 * Copyright (c) TanStack
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function re(e2, t2, s2) {
  let n2 = [], o2;
  return () => {
    let l;
    s2.key && s2.debug != null && s2.debug() && (l = Date.now());
    const c = e2();
    if (!(c.length !== n2.length || c.some((h, m) => n2[m] !== h)))
      return o2;
    n2 = c;
    let d;
    if (s2.key && s2.debug != null && s2.debug() && (d = Date.now()), o2 = t2(...c), s2 == null || s2.onChange == null || s2.onChange(o2), s2.key && s2.debug != null && s2.debug()) {
      const h = Math.round((Date.now() - l) * 100) / 100, m = Math.round((Date.now() - d) * 100) / 100, y = m / 16, v = (C, O) => {
        for (C = String(C); C.length < O; )
          C = " " + C;
        return C;
      };
      console.info("%c\u23F1 " + v(m, 5) + " /" + v(h, 5) + " ms", `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(` + Math.max(0, Math.min(120 - 120 * y, 120)) + "deg 100% 31%);", s2 == null ? void 0 : s2.key);
    }
    return o2;
  };
}
const Qt = (e2) => e2, en = (e2) => {
  const t2 = Math.max(e2.startIndex - e2.overscan, 0), s2 = Math.min(e2.endIndex + e2.overscan, e2.count - 1), n2 = [];
  for (let o2 = t2; o2 <= s2; o2++)
    n2.push(o2);
  return n2;
}, rn = (e2, t2) => {
  const s2 = new ResizeObserver((n2) => {
    var o2, l;
    t2({
      width: (o2 = n2[0]) == null ? void 0 : o2.contentRect.width,
      height: (l = n2[0]) == null ? void 0 : l.contentRect.height
    });
  });
  if (!!e2.scrollElement)
    return t2(e2.scrollElement.getBoundingClientRect()), s2.observe(e2.scrollElement), () => {
      s2.unobserve(e2.scrollElement);
    };
}, Ge = {
  element: ["scrollLeft", "scrollTop"],
  window: ["scrollX", "scrollY"]
}, tn = (e2) => (t2, s2) => {
  if (!t2.scrollElement)
    return;
  const n2 = Ge[e2][0], o2 = Ge[e2][1];
  let l = t2.scrollElement[n2], c = t2.scrollElement[o2];
  const f = () => {
    s2(t2.scrollElement[t2.options.horizontal ? n2 : o2]);
  };
  f();
  const d = (h) => {
    const m = h.currentTarget, y = m[n2], v = m[o2];
    (t2.options.horizontal ? l - y : c - v) && f(), l = y, c = v;
  };
  return t2.scrollElement.addEventListener("scroll", d, {
    capture: false,
    passive: true
  }), () => {
    t2.scrollElement.removeEventListener("scroll", d);
  };
}, nn = tn("element"), an = (e2, t2) => e2.getBoundingClientRect()[t2.options.horizontal ? "width" : "height"], sn = (e2, t2, s2) => {
  var n2;
  (n2 = s2.scrollElement) == null || n2.scrollTo == null || n2.scrollTo({
    [s2.options.horizontal ? "left" : "top"]: e2,
    behavior: t2 ? "smooth" : void 0
  });
};
class on {
  constructor(t2) {
    var s2 = this;
    this.unsubs = [], this.scrollElement = null, this.measurementsCache = [], this.itemMeasurementsCache = {}, this.pendingMeasuredCacheIndexes = [], this.measureElementCache = {}, this.range = {
      startIndex: 0,
      endIndex: 0
    }, this.setOptions = (n2) => {
      Object.entries(n2).forEach((o2) => {
        let [l, c] = o2;
        typeof c > "u" && delete n2[l];
      }), this.options = {
        debug: false,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: false,
        getItemKey: Qt,
        rangeExtractor: en,
        enableSmoothScroll: true,
        onChange: () => {
        },
        measureElement: an,
        initialRect: {
          width: 0,
          height: 0
        },
        ...n2
      };
    }, this.notify = () => {
      var n2, o2;
      (n2 = (o2 = this.options).onChange) == null || n2.call(o2, this);
    }, this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((n2) => n2()), this.unsubs = [], this.scrollElement = null;
    }, this._didMount = () => () => {
      this.cleanup();
    }, this._willUpdate = () => {
      const n2 = this.options.getScrollElement();
      this.scrollElement !== n2 && (this.cleanup(), this.scrollElement = n2, this._scrollToOffset(this.scrollOffset, false), this.unsubs.push(this.options.observeElementRect(this, (o2) => {
        this.scrollRect = o2, this.calculateRange();
      })), this.unsubs.push(this.options.observeElementOffset(this, (o2) => {
        this.scrollOffset = o2, this.calculateRange();
      })));
    }, this.getSize = () => this.scrollRect[this.options.horizontal ? "width" : "height"], this.getMeasurements = re(() => [this.options.count, this.options.paddingStart, this.options.getItemKey, this.itemMeasurementsCache], (n2, o2, l, c) => {
      const f = this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
      this.pendingMeasuredCacheIndexes = [];
      const d = this.measurementsCache.slice(0, f);
      for (let h = f; h < n2; h++) {
        const m = l(h), y = c[m], v = d[h - 1] ? d[h - 1].end : o2, C = typeof y == "number" ? y : this.options.estimateSize(h), O = v + C;
        d[h] = {
          index: h,
          start: v,
          size: C,
          end: O,
          key: m
        };
      }
      return this.measurementsCache = d, d;
    }, {
      key: false,
      debug: () => this.options.debug
    }), this.calculateRange = re(() => [this.getMeasurements(), this.getSize(), this.scrollOffset], (n2, o2, l) => {
      const c = cn({
        measurements: n2,
        outerSize: o2,
        scrollOffset: l
      });
      return (c.startIndex !== this.range.startIndex || c.endIndex !== this.range.endIndex) && (this.range = c, this.notify()), this.range;
    }, {
      key: false,
      debug: () => this.options.debug
    }), this.getIndexes = re(() => [this.options.rangeExtractor, this.range, this.options.overscan, this.options.count], (n2, o2, l, c) => n2({
      ...o2,
      overscan: l,
      count: c
    }), {
      key: false,
      debug: () => this.options.debug
    }), this.getVirtualItems = re(() => [this.getIndexes(), this.getMeasurements(), this.options.measureElement], (n2, o2, l) => {
      const c = (m) => (y) => {
        var v;
        const C = this.measurementsCache[m];
        if (!y)
          return;
        const O = l(y, this), j = (v = this.itemMeasurementsCache[C.key]) != null ? v : C.size;
        O !== j && (C.start < this.scrollOffset && (this.destinationOffset || this._scrollToOffset(this.scrollOffset + (O - j), false)), this.pendingMeasuredCacheIndexes.push(m), this.itemMeasurementsCache = {
          ...this.itemMeasurementsCache,
          [C.key]: O
        }, this.notify());
      }, f = [], d = {};
      for (let m = 0, y = n2.length; m < y; m++) {
        var h;
        const v = n2[m], O = {
          ...o2[v],
          measureElement: d[v] = (h = this.measureElementCache[v]) != null ? h : c(v)
        };
        f.push(O);
      }
      return this.measureElementCache = d, f;
    }, {
      key: false,
      debug: () => this.options.debug
    }), this.scrollToOffset = function(n2, o2) {
      let {
        align: l = "start",
        smoothScroll: c = s2.options.enableSmoothScroll
      } = o2 === void 0 ? {} : o2;
      const f = s2.scrollOffset, d = s2.getSize();
      l === "auto" && (n2 <= f ? l = "start" : n2 >= f + d ? l = "end" : l = "start"), l === "start" ? s2._scrollToOffset(n2, c) : l === "end" ? s2._scrollToOffset(n2 - d, c) : l === "center" && s2._scrollToOffset(n2 - d / 2, c);
    }, this.scrollToIndex = function(n2, o2) {
      let {
        align: l = "auto",
        smoothScroll: c = s2.options.enableSmoothScroll,
        ...f
      } = o2 === void 0 ? {} : o2;
      const d = s2.getMeasurements(), h = s2.scrollOffset, m = s2.getSize(), {
        count: y
      } = s2.options, v = d[Math.max(0, Math.min(n2, y - 1))];
      if (!v)
        return;
      if (l === "auto")
        if (v.end >= h + m - s2.options.scrollPaddingEnd)
          l = "end";
        else if (v.start <= h + s2.options.scrollPaddingStart)
          l = "start";
        else
          return;
      const C = l === "end" ? v.end + s2.options.scrollPaddingEnd : v.start - s2.options.scrollPaddingStart;
      s2.scrollToOffset(C, {
        align: l,
        smoothScroll: c,
        ...f
      });
    }, this.getTotalSize = () => {
      var n2;
      return (((n2 = this.getMeasurements()[this.options.count - 1]) == null ? void 0 : n2.end) || this.options.paddingStart) + this.options.paddingEnd;
    }, this._scrollToOffset = (n2, o2) => {
      clearTimeout(this.scrollCheckFrame), this.destinationOffset = n2, this.options.scrollToFn(n2, o2, this);
      let l;
      const c = () => {
        let f = this.scrollOffset;
        this.scrollCheckFrame = l = setTimeout(() => {
          if (this.scrollCheckFrame === l) {
            if (this.scrollOffset === f) {
              this.destinationOffset = void 0;
              return;
            }
            f = this.scrollOffset, c();
          }
        }, 100);
      };
      c();
    }, this.measure = () => {
      this.itemMeasurementsCache = {}, this.notify();
    }, this.setOptions(t2), this.scrollRect = this.options.initialRect, this.scrollOffset = this.options.initialOffset, this.calculateRange();
  }
}
const ln = (e2, t2, s2, n2) => {
  for (; e2 <= t2; ) {
    const o2 = (e2 + t2) / 2 | 0, l = s2(o2);
    if (l < n2)
      e2 = o2 + 1;
    else if (l > n2)
      t2 = o2 - 1;
    else
      return o2;
  }
  return e2 > 0 ? e2 - 1 : 0;
};
function cn(e2) {
  let {
    measurements: t2,
    outerSize: s2,
    scrollOffset: n2
  } = e2;
  const o2 = t2.length - 1, c = ln(0, o2, (d) => t2[d].start, n2);
  let f = c;
  for (; f < o2 && t2[f].end < n2 + s2; )
    f++;
  return {
    startIndex: c,
    endIndex: f
  };
}
const un = typeof window < "u" ? react.exports.useLayoutEffect : react.exports.useEffect;
function dn(e2) {
  const t2 = react.exports.useReducer(() => ({}), {})[1], s2 = {
    ...e2,
    onChange: (o2) => {
      t2(), e2.onChange == null || e2.onChange(o2);
    }
  }, [n2] = react.exports.useState(() => new on(s2));
  return n2.setOptions(s2), react.exports.useEffect(() => n2._didMount(), []), un(() => n2._willUpdate()), n2;
}
function fn(e2) {
  return dn({
    observeElementRect: rn,
    observeElementOffset: nn,
    scrollToFn: sn,
    ...e2
  });
}
function hn({
  title: e2,
  titleId: t2,
  ...s2
}, n2) {
  return /* @__PURE__ */ g("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      ref: n2,
      "aria-labelledby": t2
    }, s2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: t2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      fillRule: "evenodd",
      d: "M12 2.25a.75.75 0 01.75.75v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06l6.22 6.22V3a.75.75 0 01.75-.75z",
      clipRule: "evenodd"
    })]
  });
}
const mn = react.exports.forwardRef(hn), pn = mn;
function gn({
  title: e2,
  titleId: t2,
  ...s2
}, n2) {
  return /* @__PURE__ */ g("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      ref: n2,
      "aria-labelledby": t2
    }, s2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: t2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      fillRule: "evenodd",
      d: "M11.47 2.47a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06l-6.22-6.22V21a.75.75 0 01-1.5 0V4.81l-6.22 6.22a.75.75 0 11-1.06-1.06l7.5-7.5z",
      clipRule: "evenodd"
    })]
  });
}
const vn = react.exports.forwardRef(gn), bn = vn;
function An({
  data: e2,
  columns: t2,
  customRowRender: s2,
  virtualizeOptions: n2,
  className: o2,
  loading: l,
  error: c,
  noData: f
}) {
  const [d, h] = react.exports.useState([]), m = useReactTable({
    columns: t2,
    data: e2,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: h,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: d
    }
  }), y = react.exports.useRef(null), {
    rows: v
  } = m.getRowModel(), C = fn(n2 != null ? n2 : {
    getScrollElement: () => y.current,
    count: v.length,
    estimateSize: () => v.length,
    overscan: 10
  }), {
    getVirtualItems: O,
    getTotalSize: j
  } = C, le = O();
  return j(), /* @__PURE__ */ a(oe, {
    children: l ? /* @__PURE__ */ a(ir, {
      variant: "table"
    }) : c ? /* @__PURE__ */ a(or, {
      title: "Error",
      message: "Uh Oh. Please try again.",
      variant: "error",
      details: c
    }) : e2.length === 0 && f ? f : e2.length === 0 ? null : /* @__PURE__ */ g("table", {
      className: `border-collapse table-auto max-w-full w-full text-sm capitalize relative ${o2}`,
      ref: y,
      children: [/* @__PURE__ */ a("thead", {
        children: m.getHeaderGroups().map((P) => /* @__PURE__ */ a("tr", {
          children: P.headers.map((R) => /* @__PURE__ */ a("th", {
            onClick: R.column.getToggleSortingHandler(),
            className: "border-b dark:border-primary-600 font-medium pr-2 pl-4 pt-3 pb-3 text-primary-400 dark:text-primary-200 text-left",
            children: /* @__PURE__ */ g(ie, {
              className: "mb-0",
              children: [flexRender(R.column.columnDef.header, R.getContext()), R.column.getIsSorted() ? R.column.getIsSorted() === "desc" ? /* @__PURE__ */ a("span", {
                className: "w-3 h-3 ml-3 text-brand inline-block",
                children: /* @__PURE__ */ a(pn, {})
              }) : /* @__PURE__ */ a("span", {
                className: "w-3 h-3 ml-3 text-brand inline-block",
                children: /* @__PURE__ */ a(bn, {})
              }) : null]
            })
          }, R.id))
        }, P.id))
      }), /* @__PURE__ */ a("tbody", {
        children: le.map((P) => {
          var Z;
          const R = v[P.index];
          return (Z = s2 == null ? void 0 : s2(R)) != null ? Z : /* @__PURE__ */ a("tr", {
            children: R.getVisibleCells().map((z) => /* @__PURE__ */ a("td", {
              className: "border-b border-primary-100 dark:border-primary-700 p-2 pl-4 text-primary-500 dark:text-primary-200 text-left",
              children: flexRender(z.column.columnDef.cell, z.getContext())
            }, z.id))
          }, R.id);
        })
      })]
    })
  });
}
var Wallets = /* @__PURE__ */ ((Wallets2) => {
  Wallets2["Petra"] = "Petra";
  Wallets2["Martian"] = "Martian";
  return Wallets2;
})(Wallets || {});
class WalletAdapterCore {
  constructor(wallet_namespace, walletType) {
    __publicField(this, "__wallet_namespace");
    __publicField(this, "walletType");
    this.walletType = walletType;
    this.__wallet_namespace = wallet_namespace;
    this.getWallet = this.getWallet.bind(this);
    this.isConnected = this.isConnected.bind(this);
    this.connect = this.connect.bind(this);
    this.isDetected = this.isDetected.bind(this);
    this.swap = this.swap.bind(this);
    this.addLiquidity = this.addLiquidity.bind(this);
    this.removeLiquidity = this.removeLiquidity.bind(this);
    this.signAndSubmitTransaction = this.signAndSubmitTransaction.bind(this);
    this.signTransaction = this.signTransaction.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }
  getWallet() {
    return window[this.__wallet_namespace];
  }
  isConnected() {
    var _a;
    return (_a = this.getWallet()) == null ? void 0 : _a.isConnected();
  }
  isDetected() {
    if (this.__wallet_namespace in window)
      return true;
    return false;
  }
  async connect() {
    var _a;
    return await ((_a = this.getWallet()) == null ? void 0 : _a.connect());
  }
  async disconnect() {
    var _a;
    return await ((_a = this.getWallet()) == null ? void 0 : _a.disconnect());
  }
  async signAndSubmitTransaction(transaction) {
    var _a;
    await ((_a = this.getWallet()) == null ? void 0 : _a.signAndSubmitTransaction(transaction));
  }
  async signTransaction(transaction) {
    var _a;
    return await ((_a = this.getWallet()) == null ? void 0 : _a.signTransaction(transaction));
  }
  async swap(coinX, coinY) {
  }
  async addLiquidity(coinX, coinY) {
  }
  async removeLiquidity(coinX, coinY) {
  }
}
class MartianWalletAdapter extends WalletAdapterCore {
  constructor() {
    super("martian", Wallets.Martian);
  }
}
class PetraWalletAdapter extends WalletAdapterCore {
  constructor() {
    super("aptos", Wallets.Petra);
  }
}
const WalletContext = react.exports.createContext([null, () => {
}, null]);
const WalletContextProvider = ({
  children
}) => {
  const [activeWallet, setActiveWallet] = react.exports.useState(null);
  const [connection, setConnection] = react.exports.useState(null);
  react.exports.useEffect(() => {
    if (!connection && !activeWallet) {
      const lastWallet = localStorage.getItem("aux_last_wallet");
      switch (lastWallet) {
        case Wallets.Martian: {
          const adapter = new MartianWalletAdapter();
          if (adapter.isDetected())
            setActiveWallet(new MartianWalletAdapter());
        }
        case Wallets.Petra: {
          const adapter = new PetraWalletAdapter();
          if (adapter.isDetected())
            setActiveWallet(new PetraWalletAdapter());
        }
        default:
          return;
      }
    }
  }, []);
  react.exports.useEffect(() => {
    activeWallet == null ? void 0 : activeWallet.connect().then((c) => {
      setConnection(c);
      localStorage.setItem("aux_last_wallet", activeWallet.walletType);
    });
    return () => {
      activeWallet == null ? void 0 : activeWallet.disconnect();
    };
  }, [activeWallet]);
  return /* @__PURE__ */ jsx(WalletContext.Provider, {
    value: [activeWallet, setActiveWallet, connection],
    children
  });
};
const WalletProvider = WalletContextProvider;
function useWallet() {
  const wallet = react.exports.useContext(WalletContext);
  return wallet;
}
const LastTradePriceDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "subscription",
    "name": {
      "kind": "Name",
      "value": "LastTradePrice"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "marketInputs"
        }
      },
      "type": {
        "kind": "ListType",
        "type": {
          "kind": "NonNullType",
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "MarketInput"
            }
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "lastTradePrice"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "marketInputs"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "marketInputs"
            }
          }
        }]
      }]
    }
  }]
};
function useLastTradePrice(marketInputs) {
  const ltp = useSubscription(LastTradePriceDocument, {
    variables: {
      marketInputs: marketInputs.filter((obj) => Object.values(obj).find((x) => Boolean(x)))
    }
  });
  return ltp;
}
const PoolCoinsDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "PoolCoins"
    },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "poolCoins"
        },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "coinType"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "decimals"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "name"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "symbol"
            }
          }]
        }
      }]
    }
  }]
};
function usePoolCoins() {
  const poolCoins = useQuery(PoolCoinsDocument);
  return poolCoins;
}
const CoinXYParamCtx = react.exports.createContext(null);
const CoinXYParamCtxProvider = ({
  children
}) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const {
    params,
    setParams
  } = On();
  const coinsQuery = usePoolCoins();
  const coins = (_b = (_a = coinsQuery.data) == null ? void 0 : _a.poolCoins) != null ? _b : [];
  const defaultCoinX = (_c = coins.find(({
    coinType
  }) => coinType.toLowerCase().match("weth"))) == null ? void 0 : _c.coinType;
  const defaultCoinY = (_d = coins.find(({
    coinType
  }) => coinType.toLowerCase().match("usdc"))) == null ? void 0 : _d.coinType;
  const coinx = (_e = params.get("coinx")) != null ? _e : defaultCoinX;
  const coiny = (_f = params.get("coiny")) != null ? _f : defaultCoinY;
  const [firstCoin, setFirstCoin] = react.exports.useState(null);
  const [secondCoin, setSecondCoin] = react.exports.useState(null);
  react.exports.useEffect(() => {
    var _a2;
    if (!firstCoin) {
      setFirstCoin((_a2 = coins.find((c) => c.coinType === coinx)) != null ? _a2 : null);
    }
  }, [coinx, coins, firstCoin]);
  react.exports.useEffect(() => {
    var _a2;
    if (!secondCoin) {
      setSecondCoin((_a2 = coins.find((c) => c.coinType === coiny)) != null ? _a2 : null);
    }
  }, [coinx, coins, secondCoin]);
  react.exports.useEffect(() => {
    if ((firstCoin == null ? void 0 : firstCoin.coinType) && firstCoin.coinType !== coinx) {
      params.set("coinx", firstCoin == null ? void 0 : firstCoin.coinType);
      setParams(params);
    }
  }, [firstCoin, coinx, setParams, params]);
  react.exports.useEffect(() => {
    if ((secondCoin == null ? void 0 : secondCoin.coinType) && secondCoin.coinType !== coiny) {
      params.set("coiny", secondCoin == null ? void 0 : secondCoin.coinType);
      setParams(params);
    }
  }, [secondCoin, coinx, setParams, params]);
  const onFirstCoinSelect = (coin) => {
    setFirstCoin(coin);
    params.set("coinx", coin.coinType);
    setParams(params);
  };
  const onSecondCoinSelect = (coin) => {
    setSecondCoin(coin);
    params.set("coiny", coin.coinType);
    setParams(params);
  };
  const priceQuery = useLastTradePrice([{
    baseCoinType: (_g = firstCoin == null ? void 0 : firstCoin.coinType) != null ? _g : "",
    quoteCoinType: (_h = secondCoin == null ? void 0 : secondCoin.coinType) != null ? _h : ""
  }]);
  return /* @__PURE__ */ jsx(CoinXYParamCtx.Provider, {
    value: {
      firstCoin,
      secondCoin,
      onFirstCoinSelect,
      onSecondCoinSelect,
      coins,
      lastTradePrice: (_i = priceQuery.data) == null ? void 0 : _i.lastTradePrice
    },
    children
  });
};
function useCoinXYParamState() {
  const ctx = react.exports.useContext(CoinXYParamCtx);
  return ctx;
}
const PositionsQueryDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "PositionsQuery"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "owner"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Address"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "account"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "owner"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "owner"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "poolPositions"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinInfoX"
                },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "coinType"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "decimals"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "name"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "symbol"
                    }
                  }]
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinInfoY"
                },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "coinType"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "decimals"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "name"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "symbol"
                    }
                  }]
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinInfoLP"
                },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "coinType"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "decimals"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "name"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "symbol"
                    }
                  }]
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountX"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountY"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountLP"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "share"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
function usePositions() {
  const [wallet, , connection] = useWallet();
  const positionQuery = useQuery(PositionsQueryDocument, {
    variables: {
      owner: connection == null ? void 0 : connection.address
    },
    skip: !(connection == null ? void 0 : connection.address)
  });
  return positionQuery;
}
const CreateAuxAccountDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": {
      "kind": "Name",
      "value": "CreateAuxAccount"
    },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "createAuxAccount"
        }
      }]
    }
  }]
};
function CreateAuxAccountContainer({}) {
  const [wallet] = useWallet();
  const notifications = Lt();
  const [createAuxAccount] = useMutation(CreateAuxAccountDocument);
  const createAccount = async () => {
    const tx = await createAuxAccount().catch((err) => {
      notifications.addNotification({
        title: "Error",
        message: "Failed to create AUX account!",
        type: "error"
      });
    });
    await (wallet == null ? void 0 : wallet.signAndSubmitTransaction(tx).then(() => {
      notifications.addNotification({
        title: "Success",
        message: "AUX account created!",
        type: "success"
      });
    }).catch((err) => {
      notifications.addNotification({
        title: "Error",
        message: "Failed to create AUX account!",
        type: "error"
      });
    }));
  };
  return /* @__PURE__ */ jsx(qe, {
    size: "sm",
    onClick: createAccount,
    children: "Create AUX Account"
  });
}
function NetworkToggle({}) {
  const location = window.location;
  const networkOptions = [{
    label: "Mainnet",
    value: "https://mainnet.aux.exchange"
  }, {
    label: "Testnet",
    value: "https://testnet.aux.exchange"
  }, {
    label: "Devnet",
    value: "https://devnet.aux.exchange"
  }, {
    label: "Localnet",
    value: "http://localhost:5173"
  }];
  const currentNetwork = networkOptions.find((n2) => location.origin === n2.value);
  const onNetworkChange = (e2) => location.assign(e2 + location.pathname);
  return /* @__PURE__ */ jsx(Fragment, {
    children: currentNetwork && /* @__PURE__ */ jsx(Ln, {
      label: "",
      className: "w-[120px] mt-0 mr-3",
      value: currentNetwork,
      onChange: onNetworkChange,
      options: networkOptions
    })
  });
}
const MarketCoinsDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "MarketCoins"
    },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "marketCoins"
        },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "coinType"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "decimals"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "name"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "symbol"
            }
          }]
        }
      }]
    }
  }]
};
function useMarketCoins() {
  var _a, _b;
  const marketCoins = useQuery(MarketCoinsDocument);
  return (_b = (_a = marketCoins.data) == null ? void 0 : _a.marketCoins) != null ? _b : [];
}
const TradeHistoryDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "TradeHistory"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "owner"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Address"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "account"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "owner"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "owner"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "tradeHistory"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "baseCoinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quoteCoinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderId"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "owner"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "side"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quantity"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "price"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "value"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "auxBurned"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "time"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
function useTradeHistory() {
  const [, , connection] = useWallet();
  const tradeHistoryQuery = useQuery(TradeHistoryDocument, {
    variables: {
      owner: connection == null ? void 0 : connection.address
    },
    skip: !(connection == null ? void 0 : connection.address)
  });
  return tradeHistoryQuery;
}
function useTradeHistoryTable() {
  var _a, _b;
  const tradeHistoryQuery = useTradeHistory();
  const tableRef = react.exports.useRef(null);
  const marketCoins = useMarketCoins();
  const getMarketCoinByType = (coinType) => marketCoins.find((mc) => mc.coinType === coinType);
  const tradeHistory = (_b = (_a = tradeHistoryQuery.data) == null ? void 0 : _a.account) == null ? void 0 : _b.tradeHistory;
  const tableProps = react.exports.useMemo(() => {
    var _a2, _b2, _c;
    return {
      loading: tradeHistoryQuery.loading,
      error: (_a2 = tradeHistoryQuery.error) == null ? void 0 : _a2.message,
      noData: /* @__PURE__ */ jsx(or, {
        message: "No trades found for this market.",
        variant: "basic"
      }),
      data: (_b2 = tradeHistory == null ? void 0 : tradeHistory.map(({
        time,
        ...trade
      }) => {
        var _a3;
        return {
          ...trade,
          time: (_a3 = DateTime.fromJSDate(new Date(Number(time))).toRelative()) != null ? _a3 : ""
        };
      })) != null ? _b2 : [],
      columns: [{
        accessorKey: "side",
        header: "Side",
        cell: (cell) => {
          const value = cell.getValue();
          return /* @__PURE__ */ jsx("span", {
            className: value === "BUY" ? "text-green-500" : "text-red-500",
            children: value
          });
        }
      }, {
        accessorKey: "baseCoinType",
        header: "Base",
        cell(cell) {
          var _a3;
          const val = cell.getValue();
          const name = (_a3 = getMarketCoinByType(val)) == null ? void 0 : _a3.name;
          return name != null ? name : "-";
        }
      }, {
        accessorKey: "quoteCoinType",
        header: "Quote",
        cell(cell) {
          var _a3;
          const val = cell.getValue();
          const name = (_a3 = getMarketCoinByType(val)) == null ? void 0 : _a3.name;
          return name != null ? name : "-";
        }
      }, {
        accessorKey: "price",
        header: "Price"
      }, {
        accessorKey: "quantity",
        header: "Quantity"
      }, {
        accessorKey: "value",
        header: "Value"
      }, {
        accessorKey: "time",
        header: "Time"
      }],
      virtualizeOptions: {
        count: (_c = tradeHistory == null ? void 0 : tradeHistory.length) != null ? _c : 0,
        estimateSize: () => {
          var _a3;
          return (_a3 = tradeHistory == null ? void 0 : tradeHistory.length) != null ? _a3 : 0;
        },
        getScrollElement: () => tableRef.current,
        overscan: 20
      }
    };
  }, [tradeHistory, getMarketCoinByType, tradeHistoryQuery.loading, tradeHistoryQuery.error]);
  return [tableProps, tableRef];
}
function TradeTable({}) {
  const [tradeTableProps, tradeTableRef] = useTradeHistoryTable();
  return /* @__PURE__ */ jsx(An, {
    loading: tradeTableProps.loading,
    error: tradeTableProps.error,
    noData: tradeTableProps.noData,
    columns: tradeTableProps.columns,
    data: tradeTableProps.data,
    virtualizeOptions: tradeTableProps.virtualizeOptions,
    customRowRender: tradeTableProps.customRowRender,
    className: tradeTableProps.className
  });
}
function usePoolsTable() {
  var _a, _b;
  const poolsQuery = usePositions();
  const pools = (_b = (_a = poolsQuery.data) == null ? void 0 : _a.account) == null ? void 0 : _b.poolPositions;
  const tableRef = react.exports.useRef(null);
  const tableProps = react.exports.useMemo(() => {
    var _a2, _b2;
    return {
      loading: poolsQuery.loading,
      error: (_a2 = poolsQuery.error) == null ? void 0 : _a2.message,
      noData: /* @__PURE__ */ jsx(or, {
        message: "You have not added liquidity to any pools.",
        variant: "basic"
      }),
      data: pools != null ? pools : [],
      columns: [{
        accessorKey: "name",
        header: "Pool",
        cell: (cell) => {
          const value = cell.getValue();
          const rowValues = cell.row.original;
          const poolUrl = `/pool?coinx=${rowValues.coinInfoX}?coiny=${rowValues.coinInfoY}`;
          return /* @__PURE__ */ jsxs(Link, {
            to: poolUrl,
            className: "flex items-center gap-3 py-2",
            children: [/* @__PURE__ */ jsx(Tn, {
              size: 32,
              coins: rowValues.coinList
            }), value]
          });
        }
      }, {
        accessorKey: "coinInfoX.symbol",
        header: "Coin X"
      }, {
        accessorKey: "amountX",
        header: "Amount X"
      }, {
        accessorKey: "coinInfoY.symbol",
        header: "Coin Y"
      }, {
        accessorKey: "amountY",
        header: "Amount Y"
      }, {
        accessorKey: "share",
        header: "Share"
      }],
      virtualizeOptions: {
        count: (_b2 = pools == null ? void 0 : pools.length) != null ? _b2 : 0,
        estimateSize: () => {
          var _a3;
          return (_a3 = pools == null ? void 0 : pools.length) != null ? _a3 : 0;
        },
        getScrollElement: () => tableRef.current,
        overscan: 20
      }
    };
  }, [pools, poolsQuery.error, poolsQuery.loading]);
  return [tableProps, tableRef];
}
function PoolPositionsTable({}) {
  const [poolTableProps] = usePoolsTable();
  return /* @__PURE__ */ jsx(An, {
    loading: poolTableProps.loading,
    error: poolTableProps.error,
    noData: poolTableProps.noData,
    columns: poolTableProps.columns,
    data: poolTableProps.data,
    virtualizeOptions: poolTableProps.virtualizeOptions,
    customRowRender: poolTableProps.customRowRender,
    className: poolTableProps.className
  });
}
const BalancesDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "Balances"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "owner"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Address"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "account"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "owner"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "owner"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "balances"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinInfo"
                },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "coinType"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "decimals"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "name"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "symbol"
                    }
                  }]
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "balance"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "availableBalance"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
function useBalances() {
  const [wallet, , connection] = useWallet();
  const balancesQuery = useQuery(BalancesDocument, {
    variables: {
      owner: connection == null ? void 0 : connection.address
    },
    skip: !(connection == null ? void 0 : connection.address)
  });
  return balancesQuery;
}
function useBalancesTable() {
  var _a, _b;
  const balancesQuery = useBalances();
  const tableRef = react.exports.useRef(null);
  const balances = (_b = (_a = balancesQuery.data) == null ? void 0 : _a.account) == null ? void 0 : _b.balances;
  const tableProps = react.exports.useMemo(() => {
    var _a2, _b2;
    return {
      loading: balancesQuery.loading,
      error: (_a2 = balancesQuery.error) == null ? void 0 : _a2.message,
      noData: /* @__PURE__ */ jsx(or, {
        message: "You have no balances in your wallet. Add some to start trading.",
        variant: "basic"
      }),
      data: balances != null ? balances : [],
      columns: [
        {
          accessorKey: "coinInfo",
          header: "Coin",
          cell(cell) {
            const coinInfo = cell.getValue();
            return /* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-3",
              children: [/* @__PURE__ */ jsx(Jt, {
                coin: coinInfo == null ? void 0 : coinInfo.symbol,
                size: 32
              }), coinInfo == null ? void 0 : coinInfo.symbol]
            });
          }
        },
        {
          accessorKey: "availableBalance",
          header: "Available Balance",
          headerClassName: "text-right"
        },
        {
          accessorKey: "balance",
          header: "Total Balance"
        }
      ],
      virtualizeOptions: {
        count: (_b2 = balances == null ? void 0 : balances.length) != null ? _b2 : 0,
        estimateSize: () => {
          var _a3;
          return (_a3 = balances == null ? void 0 : balances.length) != null ? _a3 : 0;
        },
        getScrollElement: () => tableRef.current,
        overscan: 20
      }
    };
  }, [balances, balancesQuery.loading, balancesQuery.error]);
  return [tableProps, tableRef];
}
function BalancesTable({}) {
  const [balanceTableProps, balanceTableRef] = useBalancesTable();
  return /* @__PURE__ */ jsx(An, {
    loading: balanceTableProps.loading,
    error: balanceTableProps.error,
    noData: balanceTableProps.noData,
    columns: balanceTableProps.columns,
    data: balanceTableProps.data,
    virtualizeOptions: balanceTableProps.virtualizeOptions,
    customRowRender: balanceTableProps.customRowRender,
    className: balanceTableProps.className
  });
}
const OrdersDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "Orders"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "owner"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Address"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "account"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "owner"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "owner"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "openOrders"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "baseCoinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quoteCoinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderId"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "owner"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderStatus"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "side"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quantity"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "price"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "auxBurned"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "time"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "orderHistory"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "baseCoinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quoteCoinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderId"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "owner"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderStatus"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "side"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quantity"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "price"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "auxBurned"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "time"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
function useOrders() {
  const [wallet, , connection] = useWallet();
  const ordersQuery = useQuery(OrdersDocument, {
    variables: {
      owner: connection == null ? void 0 : connection.address
    },
    skip: !(connection == null ? void 0 : connection.address)
  });
  return ordersQuery;
}
const MarketDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "Market"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "marketInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "MarketInput"
          }
        }
      }
    }, {
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "owner"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Address"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "market"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "marketInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "marketInput"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "name"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "high24h"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "low24h"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "volume24h"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "baseCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "quoteCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "lotSize"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "tickSize"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "baseCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "quoteCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "orderbook"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "bids"
                },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "price"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "quantity"
                    }
                  }]
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "asks"
                },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "price"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "quantity"
                    }
                  }]
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "openOrders"
            },
            "arguments": [{
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "owner"
              },
              "value": {
                "kind": "Variable",
                "name": {
                  "kind": "Name",
                  "value": "owner"
                }
              }
            }],
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderId"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "owner"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderStatus"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "side"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quantity"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "price"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "auxBurned"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "time"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "orderHistory"
            },
            "arguments": [{
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "owner"
              },
              "value": {
                "kind": "Variable",
                "name": {
                  "kind": "Name",
                  "value": "owner"
                }
              }
            }],
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderId"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "owner"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderStatus"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "side"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quantity"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "price"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "auxBurned"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "time"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "tradeHistory"
            },
            "arguments": [{
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "owner"
              },
              "value": {
                "kind": "Variable",
                "name": {
                  "kind": "Name",
                  "value": "owner"
                }
              }
            }],
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderId"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "owner"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "side"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quantity"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "price"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "value"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "auxBurned"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "time"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
const MarketSimpleDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "MarketSimple"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "marketInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "MarketInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "market"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "marketInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "marketInput"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "name"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "baseCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "quoteCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "lotSize"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "tickSize"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "baseCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "quoteCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
const PlaceOrderDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": {
      "kind": "Name",
      "value": "PlaceOrder"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "placeOrderInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "PlaceOrderInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "placeOrder"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "placeOrderInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "placeOrderInput"
            }
          }
        }]
      }]
    }
  }]
};
const CancelOrderDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": {
      "kind": "Name",
      "value": "CancelOrder"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "cancelOrderInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "CancelOrderInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "cancelOrder"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "cancelOrderInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "cancelOrderInput"
            }
          }
        }]
      }]
    }
  }]
};
const TradingViewMarketsDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "TradingViewMarkets"
    },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "markets"
        },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "name"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "baseCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "quoteCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
const TradingViewQueryDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "TradingViewQuery"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "resolution"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Resolution"
          }
        }
      }
    }, {
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "marketInputs"
        }
      },
      "type": {
        "kind": "ListType",
        "type": {
          "kind": "NonNullType",
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "MarketInput"
            }
          }
        }
      }
    }, {
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "offset"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Int"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "markets"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "marketInputs"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "marketInputs"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "name"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "high24h"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "low24h"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "volume24h"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "bars"
            },
            "arguments": [{
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "resolution"
              },
              "value": {
                "kind": "Variable",
                "name": {
                  "kind": "Name",
                  "value": "resolution"
                }
              }
            }, {
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "offset"
              },
              "value": {
                "kind": "Variable",
                "name": {
                  "kind": "Name",
                  "value": "offset"
                }
              }
            }],
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "ohlcv"
                },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "open"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "high"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "low"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "close"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "volume"
                    }
                  }]
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "time"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
const PythRatingDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "PythRating"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "price"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Float"
          }
        }
      }
    }, {
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "side"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Side"
          }
        }
      }
    }, {
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "marketInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "MarketInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "market"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "marketInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "marketInput"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "pythRating"
            },
            "arguments": [{
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "price"
              },
              "value": {
                "kind": "Variable",
                "name": {
                  "kind": "Name",
                  "value": "price"
                }
              }
            }, {
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "side"
              },
              "value": {
                "kind": "Variable",
                "name": {
                  "kind": "Name",
                  "value": "side"
                }
              }
            }],
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "price"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "color"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
const getBadgeVariant = (val) => {
  switch (val) {
    case "open":
      return "default";
    case "filled":
      return "success";
    case "canceled":
      return "error";
    default:
      return "default";
  }
};
const baseColumns = [{
  accessorKey: "market",
  header: "Market",
  cell: (cell) => {
    const value = cell.getValue();
    const rowValues = cell.row.original;
    return /* @__PURE__ */ jsxs(Link, {
      to: "/trade",
      className: "flex items-center gap-3 py-2",
      children: [/* @__PURE__ */ jsx(Tn, {
        size: 20,
        coins: [rowValues.baseCoinInfo.symbol, rowValues.quoteCoinInfo.symbol]
      }), value]
    });
  }
}, {
  accessorKey: "side",
  header: "Side",
  cell: (cell) => {
    const value = cell.getValue();
    return /* @__PURE__ */ jsx("span", {
      className: value === "BUY" ? "text-green-500" : "text-red-500",
      children: value
    });
  }
}, {
  accessorKey: "quantity",
  header: "Amount"
}, {
  accessorKey: "price",
  header: "Price"
}, {
  accessorKey: "orderType",
  header: "Type"
}, {
  accessorKey: "time",
  header: "Time"
}, {
  accessorKey: "orderStatus",
  header: "Status",
  cell: (cell) => {
    const value = cell.getValue();
    const variant = getBadgeVariant(value);
    return /* @__PURE__ */ jsx(Mn, {
      size: "xs",
      variant,
      children: value
    });
  }
}];
function useOpenOrdersTable() {
  const [wallet, , connection] = useWallet();
  const marketCoins = useMarketCoins();
  const [cancelOrder] = useMutation(CancelOrderDocument);
  const orders = useOrders();
  const tableRef = react.exports.useRef(null);
  const getCoin = (a2) => marketCoins == null ? void 0 : marketCoins.find((m) => m.coinType === a2);
  const tableProps = react.exports.useMemo(() => {
    var _a, _b, _c, _d;
    return {
      loading: orders.loading,
      error: (_a = orders.error) == null ? void 0 : _a.message,
      noData: /* @__PURE__ */ jsx(or, {
        message: "You have no open orders for this market. Submit one and it will show up here.",
        variant: "basic"
      }),
      data: (_d = (_c = (_b = orders.data) == null ? void 0 : _b.account) == null ? void 0 : _c.openOrders.map(({
        time,
        ...order
      }) => {
        var _a2;
        const baseCoinInfo = getCoin(order.baseCoinType);
        const quoteCoinInfo = getCoin(order.quoteCoinType);
        const market = baseCoinInfo && quoteCoinInfo ? `${baseCoinInfo.symbol}/${quoteCoinInfo.symbol}` : null;
        return {
          ...order,
          baseCoinInfo,
          quoteCoinInfo,
          market,
          time: (_a2 = DateTime.fromJSDate(new Date(Number(time))).toRelative()) != null ? _a2 : ""
        };
      })) != null ? _d : [],
      columns: [...baseColumns, {
        accessorKey: "orderId",
        header: "",
        cell: (cell) => {
          var _a2, _b2, _c2;
          const value = cell.getValue();
          const idx = cell.row.index;
          const cellValue = (_c2 = (_b2 = (_a2 = orders.data) == null ? void 0 : _a2.account) == null ? void 0 : _b2.openOrders) == null ? void 0 : _c2[idx];
          const onCancelOrder = async () => {
            var _a3;
            const tx = await cancelOrder({
              variables: {
                cancelOrderInput: {
                  orderId: value,
                  sender: connection == null ? void 0 : connection.address,
                  marketInput: {
                    baseCoinType: cellValue == null ? void 0 : cellValue.baseCoinType,
                    quoteCoinType: cellValue == null ? void 0 : cellValue.quoteCoinType
                  }
                }
              }
            });
            await (wallet == null ? void 0 : wallet.signAndSubmitTransaction((_a3 = tx.data) == null ? void 0 : _a3.cancelOrder));
          };
          return /* @__PURE__ */ jsx("button", {
            onClick: onCancelOrder,
            className: "flex items-center w-[24px] h-[24px] color-primary-300 rounded-full p-1 ml-2 cursor-pointer hover:bg-primary-700 hover:color-white",
            children: /* @__PURE__ */ jsx(XMarkIcon, {
              className: "w-4 h-4"
            })
          });
        }
      }]
    };
  }, [connection == null ? void 0 : connection.address, orders.data, orders.loading]);
  return [tableProps, tableRef];
}
function useOrderHistoryTable(displayMarket) {
  var _a, _b;
  const orders = useOrders();
  const marketCoins = useMarketCoins();
  const tableRef = react.exports.useRef(null);
  const orderHistory = (_b = (_a = orders.data) == null ? void 0 : _a.account) == null ? void 0 : _b.orderHistory;
  const getCoin = (a2) => marketCoins == null ? void 0 : marketCoins.find((m) => m.coinType === a2);
  const tableProps = react.exports.useMemo(() => {
    var _a2, _b2, _c;
    return {
      loading: orders.loading,
      error: (_a2 = orders.error) == null ? void 0 : _a2.message,
      noData: /* @__PURE__ */ jsx(or, {
        message: "No past orders. Complete one and check back here.",
        variant: "basic"
      }),
      data: (_b2 = orderHistory == null ? void 0 : orderHistory.map(({
        time,
        ...order
      }) => {
        var _a3;
        const baseCoinInfo = getCoin(order.baseCoinType);
        const quoteCoinInfo = getCoin(order.quoteCoinType);
        const market = baseCoinInfo && quoteCoinInfo ? `${baseCoinInfo.symbol}/${quoteCoinInfo.symbol}` : null;
        return {
          ...order,
          baseCoinInfo,
          quoteCoinInfo,
          market,
          time: (_a3 = DateTime.fromJSDate(new Date(Number(time))).toRelative()) != null ? _a3 : ""
        };
      })) != null ? _b2 : [],
      columns: baseColumns,
      virtualizeOptions: {
        count: (_c = orderHistory == null ? void 0 : orderHistory.length) != null ? _c : 0,
        estimateSize: () => {
          var _a3;
          return (_a3 = orderHistory == null ? void 0 : orderHistory.length) != null ? _a3 : 0;
        },
        getScrollElement: () => tableRef.current,
        overscan: 20
      }
    };
  }, [orders.data, orders.loading, orders.error]);
  return [tableProps, tableRef];
}
function OrdersTable({
  variant,
  market
}) {
  const [orderTableProps] = variant && variant === "open" ? useOpenOrdersTable() : useOrderHistoryTable();
  return /* @__PURE__ */ jsx(An, {
    noData: orderTableProps.noData,
    loading: orderTableProps.loading,
    columns: orderTableProps.columns,
    data: orderTableProps.data,
    virtualizeOptions: orderTableProps.virtualizeOptions,
    customRowRender: orderTableProps.customRowRender,
    className: orderTableProps.className
  });
}
const DepositDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": {
      "kind": "Name",
      "value": "Deposit"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "depositInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "DepositInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "deposit"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "depositInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "depositInput"
            }
          }
        }]
      }]
    }
  }]
};
const WalletBalancesDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "WalletBalances"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "owner"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Address"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "account"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "owner"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "owner"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "walletBalances"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "balance"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "availableBalance"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinInfo"
                },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "coinType"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "decimals"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "name"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "symbol"
                    }
                  }]
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
const CoinList = "";
function CoinListItem({
  onCoinSelect,
  ...coinInfo
}) {
  react.exports.useCallback(() => onCoinSelect(coinInfo), [onCoinSelect, coinInfo]);
  return /* @__PURE__ */ jsxs(Do.Option, {
    value: coinInfo,
    className: "h-[60px] w-full flex items-center space-x-4 bg-transparent cursor-pointer p-4 rounded-lg hover:cursor-pointer hover:bg-secondary-800 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50",
    children: [/* @__PURE__ */ jsx(Jt, {
      coin: coinInfo.symbol
    }), /* @__PURE__ */ jsx("p", {
      className: "text-xl font-medium text-primary-100",
      children: coinInfo.symbol
    }), /* @__PURE__ */ jsx("p", {
      className: "text-xs text-primary-200",
      children: coinInfo.name
    })]
  }, coinInfo.symbol);
}
function CoinListView({
  onCoinSelect,
  coins
}) {
  return /* @__PURE__ */ jsx(Do.Options, {
    className: "bg-transparent",
    children: coins.map((info) => /* @__PURE__ */ jsx(CoinListItem, {
      onCoinSelect,
      ...info
    }, info.symbol))
  });
}
function CoinListContainer({
  onCoinSelect,
  coins
}) {
  return /* @__PURE__ */ jsx(CoinListView, {
    onCoinSelect,
    coins
  });
}
const CoinSearchModal = "";
function CoinSearchModalView({
  onCoinSelect,
  trigger,
  onQueryChange,
  query,
  coins
}) {
  var _a;
  const modalRef = react.exports.useRef(null);
  react.exports.useRef(null);
  const selectCoinAndCloseModal = react.exports.useCallback((coin) => {
    var _a2;
    onCoinSelect(coin);
    (_a2 = modalRef.current) == null ? void 0 : _a2.closeModal();
  }, []);
  return /* @__PURE__ */ jsx(Vn, {
    trigger,
    ref: modalRef,
    children: /* @__PURE__ */ jsx(ModalContents, {
      coins,
      onQueryChange,
      query,
      selectCoinAndCloseModal,
      modalOpen: Boolean((_a = modalRef.current) == null ? void 0 : _a.isOpen)
    })
  });
}
function ModalContents({
  coins,
  onQueryChange,
  query,
  selectCoinAndCloseModal,
  modalOpen
}) {
  const buttonRef = react.exports.useRef(null);
  react.exports.useEffect(() => {
    const interval = setInterval(() => {
      var _a;
      if (buttonRef.current) {
        (_a = buttonRef.current) == null ? void 0 : _a.click();
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);
  return /* @__PURE__ */ jsxs(Dn, {
    className: "bg-primary-700 min-w-[400px] min-h-[200px]",
    children: [/* @__PURE__ */ jsx(_n, {
      id: "headlessui-dialog-title-:rh:",
      children: "Select Token"
    }), /* @__PURE__ */ jsxs(Do, {
      onChange: selectCoinAndCloseModal,
      children: [/* @__PURE__ */ jsx(Do.Input, {
        placeholder: "Search Tokens",
        className: "w-full h-[56px] rounded-[16px] p-3 bg-primary-800 text-white font-azeret my-4 outline-brand",
        value: query,
        tabIndex: 0,
        onChange: onQueryChange
      }), /* @__PURE__ */ jsx(Do.Button, {
        ref: buttonRef,
        className: "hidden"
      }), /* @__PURE__ */ jsx(Do.Options, {
        children: coins ? /* @__PURE__ */ jsx(CoinListContainer, {
          onCoinSelect: selectCoinAndCloseModal,
          coins
        }) : null
      })]
    })]
  });
}
function CoinSearchModalContainer({
  onCoinSelect,
  trigger,
  coins
}) {
  const [query, setQuery] = react.exports.useState("");
  const filteredCoins = coins.filter((c) => {
    var _a;
    return query === "" ? true : (_a = c.name.toLowerCase().match(query.toLowerCase())) != null ? _a : c.symbol.toLowerCase().match(query.toLowerCase());
  });
  const onQueryChange = react.exports.useCallback((e2) => setQuery(e2.currentTarget.value), []);
  return /* @__PURE__ */ jsx(CoinSearchModalView, {
    onCoinSelect,
    trigger,
    onQueryChange,
    query,
    coins: filteredCoins
  });
}
function CoinSelectButton({
  coin,
  className
}) {
  return /* @__PURE__ */ jsx("div", {
    className,
    children: /* @__PURE__ */ jsxs("button", {
      className: "relative text-sm bg-primary-700 rounded-xl p-3 flex items-center min-h-[50px] min-w-[150px] hover:bg-primary-600",
      children: [coin ? /* @__PURE__ */ jsx(Jt, {
        coin: coin.symbol,
        size: 24
      }) : null, /* @__PURE__ */ jsx("span", {
        className: "ml-2 mr-7",
        children: coin == null ? void 0 : coin.symbol
      }), /* @__PURE__ */ jsx("div", {
        className: "absolute w-4 right-4",
        children: /* @__PURE__ */ jsx(ChevronDownIcon, {})
      })]
    })
  });
}
function DepositView({
  deposit
}) {
  var _a, _b, _c;
  const [amount, setAmount] = react.exports.useState(0);
  const [, , connection] = useWallet();
  const balances = useQuery(WalletBalancesDocument, {
    variables: {
      owner: connection == null ? void 0 : connection.address
    }
  });
  const fullBalances = (_b = (_a = balances.data) == null ? void 0 : _a.account) == null ? void 0 : _b.walletBalances;
  const coins = (_c = fullBalances == null ? void 0 : fullBalances.map((b) => b.coinInfo)) != null ? _c : [];
  const [coin, selectCoin] = react.exports.useState();
  const [balance, setBalance] = react.exports.useState("-");
  const modalRef = react.exports.useRef(null);
  react.exports.useEffect(() => {
    const currentCoin = fullBalances == null ? void 0 : fullBalances.find((b) => b.coinInfo.symbol === (coin == null ? void 0 : coin.symbol));
    if (currentCoin)
      setBalance(currentCoin.availableBalance.toString());
  }, [coin, fullBalances]);
  const notifications = Lt();
  return /* @__PURE__ */ jsx(Vn, {
    ref: modalRef,
    trigger: /* @__PURE__ */ jsx(qe, {
      size: "sm",
      onClick: () => {
      },
      children: "Deposit"
    }),
    children: /* @__PURE__ */ jsxs(Dn, {
      className: "w-[700px] mx-auto gap-4 flex flex-col",
      padding: 6,
      children: [/* @__PURE__ */ jsx(_n, {
        className: "mb-4",
        children: "Deposit"
      }), !coins.length && /* @__PURE__ */ jsx(or, {
        title: "Nothing to deposit.",
        message: "Cannot find existing balances in your wallet. Please add some money."
      }), /* @__PURE__ */ jsxs("div", {
        className: "rounded-xl p-6 flex bg-primary-800 shadow-md justify-between text-white font-bold",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex justify-between flex-auto flex-col gap-2",
          children: [/* @__PURE__ */ jsx(ie, {
            className: "text-primary-300",
            children: "Enter Deposit Amount"
          }), /* @__PURE__ */ jsx("div", {
            children: /* @__PURE__ */ jsx(CoinSearchModalContainer, {
              coins,
              trigger: /* @__PURE__ */ jsx(CoinSelectButton, {
                coin
              }),
              onCoinSelect: (c) => selectCoin(c)
            })
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex justify-between flex-auto flex-col gap-4",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "text-sm text-right",
            children: ["Available Balance: ", balance]
          }), /* @__PURE__ */ jsx("input", {
            disabled: false,
            inputMode: "decimal",
            min: "0",
            type: "number",
            onChange: (e2) => setAmount(Number(e2.currentTarget.value)),
            value: amount,
            className: "bg-transparent focus:outline-none h-[44px] text-2xl md:text-4xl placeholder:text-bds-dark-secondarys-DB500 text-white font-azeret w-full md:text-right",
            placeholder: "0.00"
          })]
        })]
      }), /* @__PURE__ */ jsx(qe, {
        disabled: !coin || Number(balance) < amount,
        onClick: () => {
          if (coin)
            deposit({
              amount,
              coinType: coin.coinType,
              from: connection == null ? void 0 : connection.address,
              to: connection == null ? void 0 : connection.address
            }).then(() => {
              var _a2;
              (_a2 = modalRef.current) == null ? void 0 : _a2.closeModal();
              notifications.addNotification({
                title: "Success",
                type: "success",
                message: "Successfully added balance!"
              });
            }).catch((err) => {
              notifications.addNotification({
                title: "Error",
                type: "error",
                message: "Failed to add balance!"
              });
            });
        },
        children: "Submit Deposit"
      })]
    })
  });
}
function DepositContainer({}) {
  const [depositMutation] = useMutation(DepositDocument);
  const deposit = async (depositInput) => {
    await depositMutation({
      variables: {
        depositInput
      }
    });
  };
  return /* @__PURE__ */ jsx(DepositView, {
    deposit
  });
}
new MartianWalletAdapter();
const petra = new PetraWalletAdapter();
const WALLETS = [petra];
const ConnectWalletView = react.exports.forwardRef(function ConnectWalletView2({
  trigger
}, _ref) {
  const backupRef = react.exports.useRef();
  const ref = _ref != null ? _ref : backupRef;
  const [options, setOptions] = react.exports.useState([]);
  const [activeWallet, setActiveWallet, connection] = useWallet();
  const suggestedBadge = /* @__PURE__ */ jsx(Mn, {
    size: "xs",
    children: "Recommended"
  });
  const connectedBadge = /* @__PURE__ */ jsx(Mn, {
    size: "xs",
    variant: "success",
    children: "Connected"
  });
  const detectedBadge = /* @__PURE__ */ jsx(Mn, {
    size: "xs",
    variant: "basic",
    children: "Detected"
  });
  const walletOptions = WALLETS.map((w) => ({
    name: w.walletType,
    checkDetected: w.isDetected,
    checkConnected: w.isConnected,
    async onClick() {
      var _a;
      await (activeWallet == null ? void 0 : activeWallet.disconnect());
      setActiveWallet(w);
      await w.connect();
      await getOptions();
      (_a = ref == null ? void 0 : ref.current) == null ? void 0 : _a.closeModal();
    }
  }));
  async function getOptions() {
    const _options = await Promise.all(walletOptions.map(async ({
      name,
      checkConnected,
      checkDetected,
      onClick
    }) => {
      const connected = Boolean(checkConnected());
      const detected = Boolean(checkDetected());
      const suggested = name === Wallets.Martian;
      const suggestedLink = /* @__PURE__ */ jsx("a", {
        href: "https://martianwallet.xyz/",
        target: "_blank",
        rel: "noreferrer",
        title: "Learn More About Martian Wallet",
        className: "text-xs inline-flex items-center",
        children: "martianwallet.xyz"
      });
      return {
        name,
        onClick,
        link: suggested ? suggestedLink : null,
        suggested,
        connected,
        detected
      };
    }));
    const result = _options.sort((a2, b) => {
      if (a2.connected)
        return -1;
      if (a2.suggested)
        return 1;
      if (a2.detected)
        return 1;
      return 1;
    });
    setOptions(result);
  }
  react.exports.useEffect(() => {
    getOptions();
  }, []);
  const renderTrigger = (defaultTrigger, walletType, address) => {
    if (walletType && address) {
      let addressResult = "";
      addressResult += address.slice(0, 4);
      addressResult += "...";
      addressResult += address.slice(address.length - 4, address.length);
      switch (walletType) {
        default:
          return /* @__PURE__ */ jsxs(qe, {
            variant: "basic",
            size: "sm",
            className: "pl-2 mr-3 inline-flex items-center",
            onClick: () => {
            },
            children: [walletType === "martian" ? /* @__PURE__ */ jsx(Jt, {
              coin: "Martian",
              size: 24
            }) : null, /* @__PURE__ */ jsxs("div", {
              className: "ml-2",
              children: [walletType, ": ", addressResult]
            })]
          });
      }
    }
    return defaultTrigger;
  };
  return /* @__PURE__ */ jsx(Fragment, {
    children: /* @__PURE__ */ jsx(Vn, {
      trigger: renderTrigger(trigger, activeWallet == null ? void 0 : activeWallet.walletType, connection == null ? void 0 : connection.address),
      ref,
      children: /* @__PURE__ */ jsxs(Dn, {
        className: "h-[400px] bg-primary-800 border border-primary-700",
        children: [/* @__PURE__ */ jsx("div", {
          className: "pb-3 text-xl bg-stripes-secondary",
          children: "Select Wallet"
        }), options.map((wallet) => /* @__PURE__ */ jsx("div", {
          onClick: wallet.onClick,
          className: `rounded-lg p-4 hover:bg-secondary-800 hover:cursor-pointer ${wallet.suggested && "bg-brand-purple/60"}`,
          children: /* @__PURE__ */ jsxs("div", {
            className: "flex items-center",
            children: [/* @__PURE__ */ jsx(Jt, {
              coin: wallet.name,
              size: 48
            }), /* @__PURE__ */ jsxs("div", {
              className: "ml-3 mr-auto flex flex-col",
              children: [/* @__PURE__ */ jsx("div", {
                className: "font-semibold",
                children: wallet.name
              }), wallet.link]
            }), /* @__PURE__ */ jsxs("div", {
              className: "inline-flex gap-2",
              children: [!wallet.connected && wallet.suggested ? suggestedBadge : null, wallet.connected ? connectedBadge : null, !wallet.connected && wallet.detected ? detectedBadge : null]
            })]
          })
        }, wallet.name))]
      })
    })
  });
});
function ConnectWalletContainer({
  trigger
}) {
  return /* @__PURE__ */ jsx(ConnectWalletView, {
    trigger
  });
}
function MarketListItem({
  market,
  className,
  onMarketSelect
}) {
  const baseClasses = "flex justify-between items-center rounded-lg p-4 transition duration-150 ease-in-out hover:cursor-pointer hover:bg-secondary-800 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50";
  const getPriceTextColor = () => {
    return "text-primary-400";
  };
  const priceTextColor = getPriceTextColor();
  const metaClasses = `text-xs font-bold flex flex-row justify-end w-full ${priceTextColor}`;
  const onMarketSelectHandler = react.exports.useCallback(() => onMarketSelect == null ? void 0 : onMarketSelect(market), [market, onMarketSelect]);
  return /* @__PURE__ */ jsxs("div", {
    className: `${baseClasses} ${className}`,
    onClick: onMarketSelectHandler,
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex shrink-0 items-center justify-center",
      children: [/* @__PURE__ */ jsx(Tn, {
        coins: [market.baseCoinInfo.symbol, market.quoteCoinInfo.symbol],
        size: 32
      }), /* @__PURE__ */ jsxs("div", {
        className: "ml-3",
        children: [/* @__PURE__ */ jsx("div", {
          className: "text-xl font-medium text-white mb-1",
          children: market.name
        }), /* @__PURE__ */ jsx("div", {
          className: "text-xs font-bold text-primary-400 uppercase"
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col items-center text-right",
      children: [/* @__PURE__ */ jsx("div", {
        className: "text-xl text-primary-200 mb-1"
      }), /* @__PURE__ */ jsx("div", {
        className: metaClasses
      })]
    })]
  });
}
function MarketList({
  markets,
  onMarketSelect
}) {
  return /* @__PURE__ */ jsx(Fragment, {
    children: markets == null ? void 0 : markets.map((item, index2) => /* @__PURE__ */ jsx(MarketListItem, {
      market: item,
      onMarketSelect
    }, `${item.name}-${index2}`))
  });
}
const GetMarketNameDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "GetMarketName"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "marketInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "MarketInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "market"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "marketInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "marketInput"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "name"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "baseCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "quoteCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
const MarketsDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "Markets"
    },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "markets"
        },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "name"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "baseCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "quoteCoinInfo"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
function useMarkets() {
  const markets = useQuery(MarketsDocument);
  return markets;
}
function MarketSelector({
  onSelectMarket
}) {
  var _a;
  const {
    onFirstCoinSelect,
    onSecondCoinSelect,
    firstCoin,
    secondCoin
  } = useCoinXYParamState();
  const marketsQuery = useMarkets();
  const marketQueryName = useQuery(GetMarketNameDocument, {
    variables: {
      marketInput: {
        baseCoinType: firstCoin == null ? void 0 : firstCoin.coinType,
        quoteCoinType: secondCoin == null ? void 0 : secondCoin.coinType
      }
    }
  });
  const markets = (_a = marketsQuery.data) == null ? void 0 : _a.markets;
  const [searchQuery, setSearchQuery] = react.exports.useState("");
  const [selectedMarket, setSelectedMarket] = react.exports.useState(null);
  react.exports.useEffect(() => {
    var _a2;
    if (!selectedMarket && marketQueryName.data) {
      setSelectedMarket((_a2 = marketQueryName.data.market) != null ? _a2 : null);
    }
  }, [selectedMarket, marketQueryName.data]);
  react.exports.useEffect(() => {
    if (selectedMarket && onSelectMarket)
      onSelectMarket(selectedMarket);
  }, [selectedMarket, onSelectMarket]);
  const filteredMarkets = markets == null ? void 0 : markets.filter((m) => searchQuery.length > 1 ? m.name.toLowerCase().match(searchQuery.toLowerCase()) : true);
  const popoverRef = react.exports.useRef(null);
  const onMarketClick = (m, close) => {
    onFirstCoinSelect(m.baseCoinInfo);
    onSecondCoinSelect(m.quoteCoinInfo);
    setSelectedMarket(m);
    close();
  };
  const onSearchChange = (c) => setSearchQuery(c.currentTarget.value);
  const baseButtonClasses = "flex items-center w-full p-3 bg-primary-800 rounded-md outline-none drop-shadow-lg hover:bg-primary-700 hover:cursor-pointer hover:drop-shadow-xl";
  return /* @__PURE__ */ jsx("div", {
    className: "w-full",
    children: /* @__PURE__ */ jsx(mt$1, {
      className: "relative",
      ref: popoverRef,
      children: ({
        open,
        close
      }) => {
        var _a2, _b, _c, _d, _e;
        return /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsxs(mt$1.Button, {
            className: `${open ? "" : "hover:bg-primary-700"} ${baseButtonClasses}`,
            children: [/* @__PURE__ */ jsx(Tn, {
              coins: [firstCoin == null ? void 0 : firstCoin.symbol, secondCoin == null ? void 0 : secondCoin.symbol],
              size: 32
            }), /* @__PURE__ */ jsx("div", {
              className: "text-xl ml-3 mr-auto text-left",
              children: (_e = `${(_b = (_a2 = selectedMarket == null ? void 0 : selectedMarket.baseCoinInfo) == null ? void 0 : _a2.symbol) != null ? _b : "..."}/${(_d = (_c = selectedMarket == null ? void 0 : selectedMarket.quoteCoinInfo) == null ? void 0 : _c.symbol) != null ? _d : "..."}`) != null ? _e : null
            }), open ? /* @__PURE__ */ jsx(ChevronUpIcon, {
              className: "h-5 w-5 text-primary-400",
              "aria-hidden": "true"
            }) : /* @__PURE__ */ jsx(ChevronDownIcon, {
              className: "h-5 w-5 text-primary-400",
              "aria-hidden": "true"
            })]
          }), /* @__PURE__ */ jsx(We, {
            as: react.exports.Fragment,
            enter: "transition ease-out duration-200",
            enterFrom: "opacity-0 translate-y-1",
            enterTo: "opacity-100 translate-y-0",
            leave: "transition ease-in duration-150",
            leaveFrom: "opacity-100 translate-y-0",
            leaveTo: "opacity-0 translate-y-1",
            children: /* @__PURE__ */ jsx(mt$1.Panel, {
              className: "absolute left-0 z-10 mt-1 w-[500px] transform px-4 sm:px-0",
              children: /* @__PURE__ */ jsx("div", {
                className: "overflow-hidden rounded-lg shadow-xl ring-1 ring-black ring-opacity-5",
                children: /* @__PURE__ */ jsxs("div", {
                  className: "relative grid bg-primary-800",
                  children: [/* @__PURE__ */ jsx("div", {
                    className: "px-4 pt-4 pb-4 border-b border-b-primary-700",
                    children: /* @__PURE__ */ jsx($n, {
                      value: searchQuery,
                      name: "marketSearch",
                      placeholder: "Search Markets",
                      label: "",
                      autoFocus: true,
                      inputClass: "bg-primary-900 pl-10",
                      prefix: /* @__PURE__ */ jsx(MagnifyingGlassIcon, {
                        width: 24,
                        height: 24
                      }),
                      onChange: onSearchChange
                    })
                  }), /* @__PURE__ */ jsx("div", {
                    className: "overflow-y-auto max-h-[500px] shadow-inner bg-primary-900/40",
                    children: /* @__PURE__ */ jsx(MarketList, {
                      markets: filteredMarkets,
                      onMarketSelect: (m) => onMarketClick(m, close)
                    })
                  })]
                })
              })
            })
          })]
        });
      }
    })
  });
}
const PoolDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "Pool"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "poolInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "PoolInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "pool"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "poolInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "poolInput"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "coinInfoX"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "coinInfoY"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "coinInfoLP"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "amountX"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "amountY"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "amountLP"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "feePercent"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "swaps"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinInfoIn"
                },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "coinType"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "decimals"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "name"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "symbol"
                    }
                  }]
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinInfoOut"
                },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "coinType"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "decimals"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "name"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "symbol"
                    }
                  }]
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountIn"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountOut"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "adds"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountAddedX"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountAddedY"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountMintedLP"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "removes"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountRemovedX"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountRemovedY"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountBurnedLP"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
function PoolsEventTableView({
  tableProps,
  actionButtonProps
}) {
  return /* @__PURE__ */ jsx("div", {
    className: "flex flex-col gap-4 items-center w-full mt-10",
    children: /* @__PURE__ */ jsxs(Dn, {
      className: "max-w-[960px] w-full max-h-full overflow-auto px-0",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex justify-between mb-4 px-6",
        children: [/* @__PURE__ */ jsx(_n, {
          children: "Transactions"
        }), /* @__PURE__ */ jsx("div", {
          className: "flex gap-2 mb-4",
          children: actionButtonProps.map((props) => /* @__PURE__ */ jsx(qe, {
            onClick: props.onClick,
            size: "sm",
            variant: "basic",
            children: props.children
          }, props.children))
        })]
      }), /* @__PURE__ */ jsx(An, {
        ...tableProps
      })]
    })
  });
}
function PoolsEventTableContainer({}) {
  var _a, _b, _c, _d, _e, _f;
  const {
    firstCoin,
    secondCoin
  } = useCoinXYParamState();
  const poolQuery = useQuery(PoolDocument, {
    variables: {
      poolInput: {
        coinTypeX: (_a = firstCoin == null ? void 0 : firstCoin.coinType) != null ? _a : "",
        coinTypeY: (_b = secondCoin == null ? void 0 : secondCoin.coinType) != null ? _b : ""
      }
    },
    skip: !(firstCoin == null ? void 0 : firstCoin.coinType) || !(secondCoin == null ? void 0 : secondCoin.coinType)
  });
  const pool = (_c = poolQuery == null ? void 0 : poolQuery.data) == null ? void 0 : _c.pool;
  const [filterBy, setFilterBy] = react.exports.useState(3);
  const swapTableData = ((_d = pool == null ? void 0 : pool.swaps) != null ? _d : []).map(({
    amountIn,
    amountOut,
    coinInfoIn,
    coinInfoOut
  }) => {
    var _a2, _b2;
    return {
      lpCoinType: (_a2 = pool == null ? void 0 : pool.coinInfoLP.coinType) != null ? _a2 : "",
      amountIn,
      amountOut,
      totalValue: (_b2 = pool == null ? void 0 : pool.amountLP) != null ? _b2 : 0,
      symbolIn: coinInfoIn.symbol,
      symbolOut: coinInfoOut.symbol,
      type: `Swap ${coinInfoIn.symbol} for ${coinInfoOut.symbol}`
    };
  });
  const addLiquidityTableData = ((_e = pool == null ? void 0 : pool.adds) != null ? _e : []).map(({
    amountAddedX,
    amountAddedY,
    amountMintedLP
  }) => {
    var _a2, _b2, _c2, _d2, _e2;
    return {
      lpCoinType: (_a2 = pool == null ? void 0 : pool.coinInfoLP.coinType) != null ? _a2 : "",
      amountIn: amountAddedX,
      amountOut: amountAddedY,
      totalValue: amountMintedLP != null ? amountMintedLP : "-",
      symbolIn: (_b2 = pool == null ? void 0 : pool.coinInfoX.symbol) != null ? _b2 : "-",
      symbolOut: (_c2 = pool == null ? void 0 : pool.coinInfoY.symbol) != null ? _c2 : "-",
      type: `Add ${(_d2 = pool == null ? void 0 : pool.coinInfoX.symbol) != null ? _d2 : ""} and ${(_e2 = pool == null ? void 0 : pool.coinInfoY.symbol) != null ? _e2 : ""}`
    };
  });
  const removeLiquidityTableData = ((_f = pool == null ? void 0 : pool.removes) != null ? _f : []).map(({
    amountBurnedLP,
    amountRemovedX,
    amountRemovedY
  }) => {
    var _a2, _b2, _c2, _d2, _e2;
    return {
      lpCoinType: (_a2 = pool == null ? void 0 : pool.coinInfoLP.coinType) != null ? _a2 : "",
      amountIn: amountRemovedX,
      amountOut: amountRemovedY,
      totalValue: amountBurnedLP != null ? amountBurnedLP : "-",
      symbolIn: (_b2 = pool == null ? void 0 : pool.coinInfoX.symbol) != null ? _b2 : "-",
      symbolOut: (_c2 = pool == null ? void 0 : pool.coinInfoY.symbol) != null ? _c2 : "-",
      type: `Remove ${(_d2 = pool == null ? void 0 : pool.coinInfoX.symbol) != null ? _d2 : ""} and ${(_e2 = pool == null ? void 0 : pool.coinInfoY.symbol) != null ? _e2 : ""}`
    };
  });
  const tableData = react.exports.useMemo(() => {
    if (filterBy === 0)
      return swapTableData;
    if (filterBy === 2)
      return removeLiquidityTableData;
    if (filterBy === 1)
      return addLiquidityTableData;
    return [...swapTableData, ...addLiquidityTableData, ...removeLiquidityTableData];
  }, [swapTableData, addLiquidityTableData, removeLiquidityTableData, filterBy]);
  const actionButtonProps = [{
    children: "All",
    onClick() {
      setFilterBy(3);
    }
  }, {
    children: "Swaps",
    onClick() {
      setFilterBy(0);
    }
  }, {
    children: "Adds",
    onClick() {
      setFilterBy(1);
    }
  }, {
    children: "Removes",
    onClick() {
      setFilterBy(2);
    }
  }];
  const poolTableProps = {
    data: tableData,
    columns: [
      {
        accessorKey: "type",
        header: "Event Type"
      },
      {
        accessorKey: "totalValue",
        header: "Total Value"
      },
      {
        accessorKey: "amountIn",
        header: ``,
        cell(c) {
          const value = c.getValue();
          return `${value} ${pool == null ? void 0 : pool.coinInfoX.symbol}`;
        }
      },
      {
        accessorKey: "amountOut",
        header: "",
        cell(c) {
          const value = c.getValue();
          return `${value} ${pool == null ? void 0 : pool.coinInfoY.symbol}`;
        }
      }
    ]
  };
  return /* @__PURE__ */ jsx(PoolsEventTableView, {
    tableProps: poolTableProps,
    actionButtonProps
  });
}
const AddLiquidity = "";
function DepositInput({
  coins,
  coin,
  onCoinSelect,
  onChange,
  value
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "relative w-full",
    children: [/* @__PURE__ */ jsx("input", {
      className: "bg-primary-800 focus:outline-none h-[70px] text-2xl md:text-4xl placeholder:text-bds-dark-secondarys-DB500 text-white font-azeret w-full md:text-left pl-3 rounded-2xl",
      placeholder: "0.00",
      onChange,
      value
    }), /* @__PURE__ */ jsx(CoinSearchModalContainer, {
      coins,
      trigger: /* @__PURE__ */ jsx(CoinSelectButton, {
        className: "absolute top-2 right-2",
        coin
      }),
      onCoinSelect
    }), /* @__PURE__ */ jsx("span", {
      className: "absolute right-2 mt-1 font-semibold text-primary-400",
      children: "Balance: 0"
    })]
  });
}
function AddLiquidityView({
  coins,
  onFirstCoinSelect,
  onSecondCoinSelect,
  firstCoin,
  secondCoin,
  addLiquidity,
  handleChangeFirstCoinAu,
  handleChangeSecondCoinAu,
  firstCoinAu,
  secondCoinAu
}) {
  return /* @__PURE__ */ jsxs(Dn, {
    className: "w-[600px] mx-auto self-center border border-slate-700",
    children: [/* @__PURE__ */ jsx(_n, {
      className: "mb-4",
      children: "Add Liquidity"
    }), /* @__PURE__ */ jsx(ie, {
      className: "mb-4 mt-4",
      children: "Deposit Amounts"
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-10",
      children: [/* @__PURE__ */ jsx(DepositInput, {
        coin: firstCoin,
        coins,
        onCoinSelect: onFirstCoinSelect,
        onChange: handleChangeFirstCoinAu,
        value: firstCoinAu
      }), /* @__PURE__ */ jsx(DepositInput, {
        coin: secondCoin,
        coins,
        onCoinSelect: onSecondCoinSelect,
        onChange: handleChangeSecondCoinAu,
        value: secondCoinAu
      })]
    }), /* @__PURE__ */ jsx(qe, {
      className: "mt-12",
      onClick: addLiquidity,
      children: "Add Liquidity"
    })]
  });
}
const AddLiquidityDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": {
      "kind": "Name",
      "value": "AddLiquidity"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "addLiquidityInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "AddLiquidityInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "addLiquidity"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "addLiquidityInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "addLiquidityInput"
            }
          }
        }]
      }]
    }
  }]
};
const SimplePoolDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "SimplePool"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "poolInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "PoolInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "pool"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "poolInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "poolInput"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "amountX"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "amountY"
            }
          }]
        }
      }]
    }
  }]
};
const PoolPriceInDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "PoolPriceIn"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "poolInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "PoolInput"
          }
        }
      }
    }, {
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "coinTypeIn"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "String"
          }
        }
      }
    }, {
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "amount"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Float"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "pool"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "poolInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "poolInput"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "priceIn"
            },
            "arguments": [{
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "coinTypeIn"
              },
              "value": {
                "kind": "Variable",
                "name": {
                  "kind": "Name",
                  "value": "coinTypeIn"
                }
              }
            }, {
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "amount"
              },
              "value": {
                "kind": "Variable",
                "name": {
                  "kind": "Name",
                  "value": "amount"
                }
              }
            }]
          }]
        }
      }]
    }
  }]
};
function usePoolPriceIn(input, skip) {
  const poolPrice = useQuery(PoolPriceInDocument, {
    variables: input,
    fetchPolicy: "network-only",
    skip
  });
  return poolPrice;
}
function AddLiquidityContainer({}) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const [addLiquidity, addLiquidityResponse] = useMutation(AddLiquidityDocument);
  const [wallet] = useWallet();
  const navigate = useNavigate();
  const [firstCoinAu, setFirstCoinAu] = react.exports.useState(0);
  const [secondCoinAu, setSecondCoinAu] = react.exports.useState(0);
  const {
    firstCoin,
    secondCoin,
    onFirstCoinSelect,
    onSecondCoinSelect,
    coins
  } = useCoinXYParamState();
  const poolQuery = useQuery(SimplePoolDocument, {
    variables: {
      poolInput: {
        coinTypeX: firstCoin == null ? void 0 : firstCoin.coinType,
        coinTypeY: secondCoin == null ? void 0 : secondCoin.coinType
      }
    },
    skip: !firstCoin || !secondCoin
  });
  const poolNoAmount = !((_b = (_a = poolQuery.data) == null ? void 0 : _a.pool) == null ? void 0 : _b.amountX);
  const firstCoinPrice = usePoolPriceIn({
    amount: firstCoinAu,
    coinTypeIn: firstCoin == null ? void 0 : firstCoin.coinType,
    poolInput: {
      coinTypeX: firstCoin == null ? void 0 : firstCoin.coinType,
      coinTypeY: secondCoin == null ? void 0 : secondCoin.coinType
    }
  }, poolNoAmount);
  const secondCoinPrice = usePoolPriceIn({
    amount: secondCoinAu,
    coinTypeIn: secondCoin == null ? void 0 : secondCoin.coinType,
    poolInput: {
      coinTypeX: firstCoin == null ? void 0 : firstCoin.coinType,
      coinTypeY: secondCoin == null ? void 0 : secondCoin.coinType
    }
  }, poolNoAmount);
  const conversionIn = (_e = (_d = (_c = firstCoinPrice.data) == null ? void 0 : _c.pool) == null ? void 0 : _d.priceIn) != null ? _e : 0;
  const conversionOut = (_h = (_g = (_f = secondCoinPrice.data) == null ? void 0 : _f.pool) == null ? void 0 : _g.priceIn) != null ? _h : 0;
  const notifications = Lt();
  async function addLiquidityHandler() {
    return await addLiquidity({
      variables: {
        addLiquidityInput: {
          amountX: firstCoinAu,
          amountY: secondCoinAu,
          poolInput: {
            coinTypeX: firstCoin.coinType,
            coinTypeY: secondCoin.coinType
          }
        }
      }
    }).then(async (res) => {
      var _a2;
      await (wallet == null ? void 0 : wallet.signAndSubmitTransaction((_a2 = res.data) == null ? void 0 : _a2.addLiquidity).then(() => {
        notifications.addNotification({
          title: "Success",
          message: "Successfully added liquidity",
          type: "success"
        });
      }).catch((e2) => notifications.addNotification({
        title: "Error",
        message: "Error adding liquidity",
        type: "error"
      })));
    }).catch((e2) => notifications.addNotification({
      title: "Error",
      message: "Error adding liquidity",
      type: "error"
    })).finally(() => navigate("/pools"));
  }
  const handleChangeSecondCoinAu = (e2) => {
    const v = Number(e2.currentTarget.value);
    setSecondCoinAu(v);
    setTouched("second");
  };
  const [touched, setTouched] = react.exports.useState("first");
  react.exports.useEffect(() => {
    if (touched === "first" && !poolNoAmount)
      setSecondCoinAu(conversionIn != null ? conversionIn : 0);
  }, [conversionIn, firstCoinAu, touched]);
  react.exports.useEffect(() => {
    if (touched === "second" && !poolNoAmount)
      setFirstCoinAu(conversionOut != null ? conversionOut : 0);
  }, [conversionOut, secondCoinAu, touched]);
  const handleChangeFirstCoinAu = (e2) => {
    const v = Number(e2.currentTarget.value);
    setFirstCoinAu(v);
    setTouched("first");
  };
  return /* @__PURE__ */ jsx(AddLiquidityView, {
    coins,
    onFirstCoinSelect,
    onSecondCoinSelect,
    firstCoin,
    secondCoin,
    addLiquidity: addLiquidityHandler,
    handleChangeFirstCoinAu,
    handleChangeSecondCoinAu,
    firstCoinAu,
    secondCoinAu
  });
}
const RemoveLiquidityDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": {
      "kind": "Name",
      "value": "RemoveLiquidity"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "removeLiquidityInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "RemoveLiquidityInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "removeLiquidity"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "removeLiquidityInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "removeLiquidityInput"
            }
          }
        }]
      }]
    }
  }]
};
const RlPoolPositionDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "RLPoolPosition"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "poolInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "PoolInput"
          }
        }
      }
    }, {
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "owner"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Address"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "pool"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "poolInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "poolInput"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "coinInfoX"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "coinInfoY"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "coinInfoLP"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "position"
            },
            "arguments": [{
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "owner"
              },
              "value": {
                "kind": "Variable",
                "name": {
                  "kind": "Name",
                  "value": "owner"
                }
              }
            }],
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountX"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountY"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amountLP"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "share"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "amountX"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "amountY"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "amountLP"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "feePercent"
            }
          }]
        }
      }]
    }
  }]
};
const SwapDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": {
      "kind": "Name",
      "value": "Swap"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "swapInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "SwapInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "swap"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "swapInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "swapInput"
            }
          }
        }]
      }]
    }
  }]
};
const RemoveLiquidity = "";
function RemoveLiquidityView({
  firstCoin,
  firstCoinAmount,
  firstCoinRelativePrice,
  secondCoinAmount,
  secondCoinRelativePrice,
  goBackToPools,
  handleRemoveLiquidity,
  pctVal,
  secondCoin,
  setPctVal,
  notFoundMsg
}) {
  return !firstCoin && !secondCoin ? /* @__PURE__ */ jsxs(Dn, {
    className: "flex flex-col gap-8 w-[600px] mx-auto self-center",
    children: [notFoundMsg, /* @__PURE__ */ jsx(qe, {
      onClick: goBackToPools,
      children: "Back to pools"
    })]
  }) : /* @__PURE__ */ jsxs(Dn, {
    className: "flex flex-col w-[600px] gap-6 mx-auto self-center border border-slate-700",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex justify-between items-center",
      children: [/* @__PURE__ */ jsx(_n, {
        children: "Remove Liquidity"
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex text-xs text-slate-300",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex gap-4",
          children: firstCoinRelativePrice ? `1 ${firstCoin == null ? void 0 : firstCoin.symbol} = ${firstCoinRelativePrice} ${secondCoin == null ? void 0 : secondCoin.symbol}` : `${firstCoin == null ? void 0 : firstCoin.symbol} Price Unavailable.`
        }), /* @__PURE__ */ jsx("span", {
          className: "px-3",
          children: "/"
        }), /* @__PURE__ */ jsx("div", {
          className: "flex gap-4",
          children: secondCoinRelativePrice ? `1 ${secondCoin == null ? void 0 : secondCoin.symbol} = ${secondCoinRelativePrice} ${firstCoin == null ? void 0 : firstCoin.symbol}` : `${secondCoin == null ? void 0 : secondCoin.symbol} Price Unavailable`
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-4",
      children: [/* @__PURE__ */ jsx(ie, {
        children: "Amount To Withdraw"
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex flex-row justify-between",
        children: [/* @__PURE__ */ jsx("div", {
          className: "text-4xl text-white font-bold mr-auto",
          children: `${pctVal}%`
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex justify-start items-center gap-2",
          children: [/* @__PURE__ */ jsx(qe, {
            variant: "basic",
            size: "xs",
            onClick: () => setPctVal(25),
            children: "25%"
          }), /* @__PURE__ */ jsx(qe, {
            variant: "basic",
            size: "xs",
            onClick: () => setPctVal(50),
            children: "50%"
          }), /* @__PURE__ */ jsx(qe, {
            variant: "basic",
            size: "xs",
            onClick: () => setPctVal(75),
            children: "75%"
          }), /* @__PURE__ */ jsx(qe, {
            variant: "basic",
            size: "xs",
            onClick: () => setPctVal(100),
            children: "Max"
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "px-2",
        children: /* @__PURE__ */ jsx(In, {
          value: pctVal,
          onChange: setPctVal,
          min: 0,
          max: 100
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "w-full flex justify-center items-center",
      children: [/* @__PURE__ */ jsx("div", {
        className: "border-b border-b-slate-700 w-full"
      }), /* @__PURE__ */ jsx("div", {
        children: /* @__PURE__ */ jsx(ArrowDownIcon, {
          className: "w-4 text-slate-400 mx-6"
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "border-b border-b-slate-700 w-full"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-4 pb-6 items-center",
      children: [/* @__PURE__ */ jsx(ie, {
        children: "Amount To Receive"
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex flex-row gap-6",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex items-center gap-2",
          children: (firstCoin == null ? void 0 : firstCoin.symbol) ? /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsx(Jt, {
              coin: firstCoin == null ? void 0 : firstCoin.symbol
            }), " ", firstCoinAmount]
          }) : /* @__PURE__ */ jsx(Fragment, {
            children: "No Coin Selected"
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "flex items-center gap-2",
          children: (secondCoin == null ? void 0 : secondCoin.symbol) ? /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsx(Jt, {
              coin: secondCoin == null ? void 0 : secondCoin.symbol
            }), " ", secondCoinAmount]
          }) : /* @__PURE__ */ jsx(Fragment, {
            children: "No Coin Selected"
          })
        })]
      })]
    }), /* @__PURE__ */ jsx(qe, {
      onClick: handleRemoveLiquidity,
      children: "Remove Liquidity"
    })]
  });
}
function RemoveLiquidityContainer({}) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n2, _o, _p, _q, _r, _s, _t2, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H;
  const navigate = useNavigate();
  const [removeLiquidityMutation, removeLiquidityResult] = useMutation(RemoveLiquidityDocument);
  const [wallet, , connection] = useWallet();
  const {
    firstCoin,
    secondCoin
  } = useCoinXYParamState();
  const notFoundMsg = `Cannot find coins for types ${firstCoin == null ? void 0 : firstCoin.symbol} and ${secondCoin == null ? void 0 : secondCoin.symbol}`;
  const poolQuery = useQuery(RlPoolPositionDocument, {
    variables: {
      poolInput: {
        coinTypeX: (_a = firstCoin == null ? void 0 : firstCoin.coinType) != null ? _a : "",
        coinTypeY: (_b = secondCoin == null ? void 0 : secondCoin.coinType) != null ? _b : ""
      },
      owner: connection == null ? void 0 : connection.address
    },
    skip: !firstCoin
  });
  const firstCoinRelativePriceQuery = usePoolPriceIn({
    amount: 1,
    coinTypeIn: (_e = (_d = (_c = poolQuery.data) == null ? void 0 : _c.pool) == null ? void 0 : _d.coinInfoX.coinType) != null ? _e : "",
    poolInput: {
      coinTypeX: (_h = (_g = (_f = poolQuery.data) == null ? void 0 : _f.pool) == null ? void 0 : _g.coinInfoX.coinType) != null ? _h : "",
      coinTypeY: (_k = (_j = (_i = poolQuery.data) == null ? void 0 : _i.pool) == null ? void 0 : _j.coinInfoY.coinType) != null ? _k : ""
    }
  });
  const secondCoinRelativePriceQuery = usePoolPriceIn({
    amount: 1,
    coinTypeIn: (_n2 = (_m = (_l = poolQuery.data) == null ? void 0 : _l.pool) == null ? void 0 : _m.coinInfoY.coinType) != null ? _n2 : "",
    poolInput: {
      coinTypeX: (_q = (_p = (_o = poolQuery.data) == null ? void 0 : _o.pool) == null ? void 0 : _p.coinInfoX.coinType) != null ? _q : "",
      coinTypeY: (_t2 = (_s = (_r = poolQuery.data) == null ? void 0 : _r.pool) == null ? void 0 : _s.coinInfoY.coinType) != null ? _t2 : ""
    }
  });
  const [pctVal, setPctVal] = react.exports.useState(0);
  const handleRemoveLiquidity = react.exports.useCallback(async function handleRemoveLiquidity2() {
    var _a2, _b2, _c2, _d2, _e2;
    const res = await removeLiquidityMutation({
      variables: {
        removeLiquidityInput: {
          amountLP: pctVal / 100 * ((_d2 = (_c2 = (_b2 = (_a2 = poolQuery.data) == null ? void 0 : _a2.pool) == null ? void 0 : _b2.position) == null ? void 0 : _c2.amountLP) != null ? _d2 : 0),
          poolInput: {
            coinTypeX: firstCoin.coinType,
            coinTypeY: secondCoin.coinType
          }
        }
      }
    });
    const tx = (_e2 = res.data) == null ? void 0 : _e2.removeLiquidity;
    await (wallet == null ? void 0 : wallet.signAndSubmitTransaction(tx));
    navigate("/pools");
  }, [firstCoin, secondCoin, pctVal, navigate, removeLiquidityMutation, wallet]);
  const firstCoinAmount = ((_x = (_w = (_v = (_u = poolQuery.data) == null ? void 0 : _u.pool) == null ? void 0 : _v.position) == null ? void 0 : _w.amountX) != null ? _x : 1e3) * (pctVal / 100);
  const secondCoinAmount = ((_B = (_A = (_z = (_y = poolQuery.data) == null ? void 0 : _y.pool) == null ? void 0 : _z.position) == null ? void 0 : _A.amountY) != null ? _B : 1e3) * (pctVal / 100);
  return /* @__PURE__ */ jsx(RemoveLiquidityView, {
    firstCoin,
    firstCoinAmount,
    firstCoinRelativePrice: (_E = (_D = (_C = firstCoinRelativePriceQuery.data) == null ? void 0 : _C.pool) == null ? void 0 : _D.priceIn) != null ? _E : 0,
    secondCoinRelativePrice: (_H = (_G = (_F = secondCoinRelativePriceQuery.data) == null ? void 0 : _F.pool) == null ? void 0 : _G.priceIn) != null ? _H : 0,
    secondCoinAmount,
    goBackToPools: () => navigate("/pools"),
    handleRemoveLiquidity,
    pctVal,
    setPctVal,
    secondCoin,
    notFoundMsg
  });
}
function PoolView({
  pool
}) {
  var _a, _b;
  const [isAddOpen, setAddOpen] = react.exports.useState(false);
  const [isRemoveOpen, setRemoveOpen] = react.exports.useState(false);
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col items-center w-[960px] mx-auto",
    children: [/* @__PURE__ */ jsxs(Link, {
      to: "/pools",
      className: "self-start inline-flex items-center my-4",
      children: [/* @__PURE__ */ jsx(ArrowLongLeftIcon, {
        className: "w-8 h-8 mr-3"
      }), " All Pools"]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex my-6",
      children: [/* @__PURE__ */ jsx("div", {
        className: "flex",
        children: pool && /* @__PURE__ */ jsx(Tn, {
          coins: [pool == null ? void 0 : pool.coinInfoX.symbol, pool == null ? void 0 : pool.coinInfoY.symbol],
          size: 48
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "self-center ml-4 text-4xl",
        children: `${pool == null ? void 0 : pool.coinInfoX.name} / ${pool == null ? void 0 : pool.coinInfoY.name}`
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex",
      children: [/* @__PURE__ */ jsx(Pn, {
        title: `${pool == null ? void 0 : pool.coinInfoX.name} Locked`,
        value: (_a = pool == null ? void 0 : pool.amountX) != null ? _a : "-"
      }), /* @__PURE__ */ jsx(Pn, {
        title: `${pool == null ? void 0 : pool.coinInfoY.name} Locked`,
        value: (_b = pool == null ? void 0 : pool.amountY) != null ? _b : "-"
      }), /* @__PURE__ */ jsx(Pn, {
        title: "Fee Percent",
        value: (pool == null ? void 0 : pool.feePercent) ? `${pool.feePercent}%` : "-"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex gap-4 mt-6",
      children: [/* @__PURE__ */ jsx(qe, {
        onClick: () => setAddOpen(true),
        variant: "buy",
        size: "sm",
        children: "Add"
      }), /* @__PURE__ */ jsx(qe, {
        onClick: () => setRemoveOpen(true),
        variant: "sell",
        size: "sm",
        children: "Remove"
      })]
    }), /* @__PURE__ */ jsx(PoolsEventTableContainer, {}), /* @__PURE__ */ jsx(We, {
      appear: true,
      show: isAddOpen,
      as: react.exports.Fragment,
      children: /* @__PURE__ */ jsxs(gt$1, {
        as: "div",
        className: "relative z-10",
        onClose: () => setAddOpen(false),
        children: [/* @__PURE__ */ jsx(We.Child, {
          as: react.exports.Fragment,
          enter: "ease-out duration-300",
          enterFrom: "opacity-0",
          enterTo: "opacity-100",
          leave: "ease-in duration-200",
          leaveFrom: "opacity-100",
          leaveTo: "opacity-0",
          children: /* @__PURE__ */ jsx("div", {
            className: "fixed inset-0 bg-black bg-opacity-25"
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "fixed inset-0 overflow-y-auto",
          children: /* @__PURE__ */ jsx("div", {
            className: "flex min-h-full items-center justify-center p-4 text-center",
            children: /* @__PURE__ */ jsx(We.Child, {
              as: react.exports.Fragment,
              enter: "ease-out duration-300",
              enterFrom: "opacity-0 scale-95",
              enterTo: "opacity-100 scale-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100 scale-100",
              leaveTo: "opacity-0 scale-95",
              children: /* @__PURE__ */ jsx(gt$1.Panel, {
                className: "m-w-[700px] bg-primary-900 transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all",
                children: /* @__PURE__ */ jsx(AddLiquidityContainer, {})
              })
            })
          })
        })]
      })
    }), /* @__PURE__ */ jsx(We, {
      appear: true,
      show: isRemoveOpen,
      as: react.exports.Fragment,
      children: /* @__PURE__ */ jsxs(gt$1, {
        as: "div",
        className: "relative z-10",
        onClose: () => setRemoveOpen(false),
        children: [/* @__PURE__ */ jsx(We.Child, {
          as: react.exports.Fragment,
          enter: "ease-out duration-300",
          enterFrom: "opacity-0",
          enterTo: "opacity-100",
          leave: "ease-in duration-200",
          leaveFrom: "opacity-100",
          leaveTo: "opacity-0",
          children: /* @__PURE__ */ jsx("div", {
            className: "fixed inset-0 bg-black bg-opacity-25"
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "fixed inset-0 overflow-y-auto",
          children: /* @__PURE__ */ jsx("div", {
            className: "flex min-h-full items-center justify-center p-4 text-center",
            children: /* @__PURE__ */ jsx(We.Child, {
              as: react.exports.Fragment,
              enter: "ease-out duration-300",
              enterFrom: "opacity-0 scale-95",
              enterTo: "opacity-100 scale-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100 scale-100",
              leaveTo: "opacity-0 scale-95",
              children: /* @__PURE__ */ jsx(gt$1.Panel, {
                className: "m-w-[700px] bg-primary-800 transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all",
                children: /* @__PURE__ */ jsx(RemoveLiquidityContainer, {})
              })
            })
          })
        })]
      })
    })]
  });
}
function PoolContainer({}) {
  var _a, _b;
  const {
    firstCoin,
    secondCoin
  } = useCoinXYParamState();
  const poolQuery = useQuery(PoolDocument, {
    variables: {
      poolInput: {
        coinTypeX: (_a = firstCoin == null ? void 0 : firstCoin.coinType) != null ? _a : "",
        coinTypeY: (_b = secondCoin == null ? void 0 : secondCoin.coinType) != null ? _b : ""
      }
    }
  });
  const pool = react.exports.useMemo(() => {
    var _a2, _b2;
    return (_b2 = (_a2 = poolQuery.data) == null ? void 0 : _a2.pool) != null ? _b2 : null;
  }, [poolQuery.data]);
  return /* @__PURE__ */ jsx(PoolView, {
    pool
  });
}
const connectWalletTrigger = /* @__PURE__ */ jsx(qe, {
  onClick: () => {
  },
  size: "sm",
  children: "Connect Wallet"
});
const noWalletUI = /* @__PURE__ */ jsxs(Dn, {
  className: "flex flex-col max-w-[600px] mx-auto self-center opacity-90",
  children: [/* @__PURE__ */ jsx("div", {
    className: "text-3xl mb-2",
    children: "Portfolio"
  }), /* @__PURE__ */ jsx("div", {
    className: "text-lg mb-8 text-slate-300",
    children: "Connect your Aptos Wallet to view your portfolio and start trading."
  }), /* @__PURE__ */ jsx(ConnectWalletContainer, {
    trigger: connectWalletTrigger
  })]
});
function PortfolioView({
  positions
}) {
  const [wallet, , connection] = useWallet();
  (connection == null ? void 0 : connection.address) ? `${connection.address.slice(0, 6)}...${connection.address.slice(connection.address.length - 6, connection.address.length)}` : "-";
  return !connection || connection.address === null ? noWalletUI : /* @__PURE__ */ jsxs("div", {
    className: " w-full grid sm:grid-cols-1 sm:grid-rows-5 md:grid-rows-[48px_260px_1fr] md:grid-cols-6 gap-2 p-4 mx-auto md:max-w-[1140px]",
    children: [/* @__PURE__ */ jsx("div", {
      className: " sm:col-span-1 md:col-span-6 h-full",
      children: /* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-between",
        children: [/* @__PURE__ */ jsx("div", {
          className: "text-3xl",
          children: "My Portfolio"
        }), /* @__PURE__ */ jsxs("div", {
          className: "items-end flex gap-4",
          children: [/* @__PURE__ */ jsx(CreateAuxAccountContainer, {}), /* @__PURE__ */ jsx(DepositContainer, {})]
        })]
      })
    }), /* @__PURE__ */ jsxs(Dn, {
      className: "sm:col-span-6",
      children: [/* @__PURE__ */ jsx(_n, {
        className: "inline-flex items-center gap-3",
        children: /* @__PURE__ */ jsx(Mn, {
          variant: "dark",
          size: "sm",
          children: "Coming Soon"
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex items-end justify-stretch py-6 shadow h-full space-x-4",
        children: [/* @__PURE__ */ jsx("div", {
          className: "w-full h-12 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-16 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-20 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-24 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-28 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-32 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-36 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-40 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-12 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-16 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-20 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-24 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-28 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-32 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-36 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-40 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-12 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-16 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-20 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-24 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-28 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-32 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-36 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-40 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-12 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-16 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-20 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-24 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-28 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-32 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-36 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-40 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-12 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-16 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-20 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-24 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-28 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-32 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-36 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        }), /* @__PURE__ */ jsx("div", {
          className: "w-full h-40 bg-gray-200 rounded-t-lg dark:bg-gray-700"
        })]
      })]
    }), /* @__PURE__ */ jsx(Dn, {
      className: "sm:col-span-6",
      padding: 0,
      children: /* @__PURE__ */ jsxs(Ge$1.Group, {
        children: [/* @__PURE__ */ jsx(jn, {
          tabs: [
            {
              label: "Balances"
            },
            {
              label: "Pool Stakes"
            },
            {
              label: "Open Orders"
            },
            {
              label: "Order History"
            }
          ]
        }), /* @__PURE__ */ jsxs(Ge$1.Panels, {
          children: [/* @__PURE__ */ jsx(Ge$1.Panel, {
            children: /* @__PURE__ */ jsx(BalancesTable, {})
          }), /* @__PURE__ */ jsx(Ge$1.Panel, {
            children: /* @__PURE__ */ jsx(PoolPositionsTable, {})
          }), /* @__PURE__ */ jsx(Ge$1.Panel, {
            children: /* @__PURE__ */ jsx(OrdersTable, {
              variant: "open"
            })
          }), /* @__PURE__ */ jsx(Ge$1.Panel, {
            children: /* @__PURE__ */ jsx(OrdersTable, {})
          })]
        })]
      })
    })]
  });
}
function PortfolioContainer({}) {
  var _a, _b;
  const positions = usePositions();
  return /* @__PURE__ */ jsx(PortfolioView, {
    positions: (_b = (_a = positions.data) == null ? void 0 : _a.account) == null ? void 0 : _b.poolPositions
  });
}
var OrderType = /* @__PURE__ */ ((OrderType2) => {
  OrderType2["FillOrKill"] = "FILL_OR_KILL";
  OrderType2["ImmediateOrCancel"] = "IMMEDIATE_OR_CANCEL";
  OrderType2["Limit"] = "LIMIT";
  OrderType2["PassiveJoin"] = "PASSIVE_JOIN";
  OrderType2["PostOnly"] = "POST_ONLY";
  return OrderType2;
})(OrderType || {});
var Resolution = /* @__PURE__ */ ((Resolution2) => {
  Resolution2["Days_1"] = "DAYS_1";
  Resolution2["Hours_1"] = "HOURS_1";
  Resolution2["Hours_4"] = "HOURS_4";
  Resolution2["Minutes_1"] = "MINUTES_1";
  Resolution2["Minutes_5"] = "MINUTES_5";
  Resolution2["Minutes_15"] = "MINUTES_15";
  Resolution2["Seconds_15"] = "SECONDS_15";
  Resolution2["Weeks_1"] = "WEEKS_1";
  return Resolution2;
})(Resolution || {});
var Side = /* @__PURE__ */ ((Side2) => {
  Side2["Buy"] = "BUY";
  Side2["Sell"] = "SELL";
  return Side2;
})(Side || {});
const configurationData = {
  supported_resolutions: ["1D"],
  exchanges: [{
    value: "AUX",
    name: "AUX Exchange",
    desc: "Aux Exchange"
  }],
  symbols_types: [
    {
      name: "crypto",
      value: "crypto"
    }
  ]
};
const DataFeedCtx = react.exports.createContext(null);
const DataFeedProvider = ({
  children
}) => {
  const [getMarkets] = useLazyQuery(TradingViewMarketsDocument);
  const [markets, setMarkets] = react.exports.useState([]);
  const getAllSymbols = (mkts) => {
    var _a;
    return (_a = mkts == null ? void 0 : mkts.map((c) => ({
      symbol: `${c.name}`,
      full_name: `${c.name}`,
      exchange: "AUX",
      type: "crypto"
    }))) != null ? _a : [];
  };
  function onReady(callback) {
    setTimeout(() => callback(configurationData));
  }
  async function searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    var _a;
    let _markets = markets;
    if (!markets.length) {
      _markets = await ((_a = (await getMarkets()).data) == null ? void 0 : _a.markets);
      setMarkets(_markets);
    }
    const symbols = getAllSymbols(_markets);
    const newSymbols = symbols.filter((symbol) => {
      const isExchangeValid = exchange === "" || symbol.exchange === exchange;
      const isFullSymbolContainsInput = symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
      return isExchangeValid && isFullSymbolContainsInput;
    });
    onResultReadyCallback(newSymbols);
  }
  async function resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    var _a;
    let _markets = markets;
    if (!markets.length) {
      _markets = await ((_a = (await getMarkets()).data) == null ? void 0 : _a.markets);
      setMarkets(_markets);
    }
    const symbols = getAllSymbols(_markets);
    const symbolItem = symbols.find(({
      full_name
    }) => full_name === symbolName);
    let retryCount = 3;
    if (!symbolItem) {
      const errorCallbackFactory = (retries) => {
        if (!retries)
          return onResolveErrorCallback;
        return () => {
        };
      };
      while (retryCount) {
        await new Promise((res) => setTimeout(() => res({}), 500));
        retryCount--;
        await dataFeed.resolveSymbol(symbolName, onSymbolResolvedCallback, errorCallbackFactory(retryCount));
      }
      onResolveErrorCallback("Cannot resolve symbol. If this symbol is valid please try to again in a moment.");
      return;
    }
    const symbolInfo = {
      ticker: symbolItem.full_name,
      name: symbolItem.symbol,
      description: symbolItem.symbol,
      type: symbolItem.type,
      session: "24x7",
      timezone: "Etc/UTC",
      exchange: symbolItem.exchange,
      minmov: 1,
      pricescale: 100,
      has_intraday: false,
      has_no_volume: true,
      has_weekly_and_monthly: false,
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: 2,
      data_status: "streaming"
    };
    onSymbolResolvedCallback(symbolInfo);
  }
  async function getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
    var _a, _b, _c, _d, _e;
    const {
      from,
      to,
      firstDataRequest,
      countBack
    } = periodParams;
    try {
      let _markets = markets;
      if (!markets.length) {
        _markets = await ((_a = (await getMarkets()).data) == null ? void 0 : _a.markets);
        setMarkets(_markets);
      }
      const market = _markets == null ? void 0 : _markets.find((m) => m.name === symbolInfo.ticker);
      const data = market && await client.query({
        query: TradingViewQueryDocument,
        variables: {
          resolution: Resolution.Days_1,
          marketInputs: [{
            baseCoinType: (_b = market == null ? void 0 : market.baseCoinInfo.coinType) != null ? _b : "",
            quoteCoinType: (_c = market == null ? void 0 : market.quoteCoinInfo.coinType) != null ? _c : ""
          }],
          offset: countBack
        }
      });
      if (!data || data.errors || !data.loading && !((_d = data.data.markets[0]) == null ? void 0 : _d.bars.length)) {
        onHistoryCallback([], {
          noData: true
        });
        return;
      }
      const bars = [];
      (_e = data.data.markets[0]) == null ? void 0 : _e.bars.forEach(({
        time,
        ohlcv
      }) => {
        if (ohlcv) {
          const {
            open,
            high,
            low,
            close,
            volume
          } = ohlcv;
          bars.push({
            open,
            high,
            low,
            close,
            volume,
            time: Number(time)
          });
        }
      });
      onHistoryCallback(bars, {
        noData: false
      });
    } catch (error) {
      onErrorCallback(error);
    }
  }
  const dataFeed = {
    onReady,
    searchSymbols,
    resolveSymbol,
    getBars,
    subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
    },
    unsubscribeBars: (subscriberUID) => {
    }
  };
  return /* @__PURE__ */ jsx(DataFeedCtx.Provider, {
    value: dataFeed,
    children
  });
};
function useDataFeed() {
  return react.exports.useContext(DataFeedCtx);
}
const MarketTrades = "";
const SimpleMarketQueryDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "SimpleMarketQuery"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "marketInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "MarketInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "market"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "marketInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "marketInput"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "tradeHistory"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "baseCoinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quoteCoinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "orderId"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "owner"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "side"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quantity"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "price"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "value"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "auxBurned"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "time"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
function MarketTradesView({}) {
  var _a;
  const {
    firstCoin,
    secondCoin
  } = useCoinXYParamState();
  const marketTradesSubscription = useQuery(SimpleMarketQueryDocument, {
    variables: {
      marketInput: {
        baseCoinType: firstCoin == null ? void 0 : firstCoin.coinType,
        quoteCoinType: secondCoin == null ? void 0 : secondCoin.coinType
      }
    },
    pollInterval: 5e3,
    skip: !firstCoin || !secondCoin
  });
  const [marketTrades, setMarketTrades] = react.exports.useState([]);
  React.useEffect(() => {
    setMarketTrades((prev) => {
      var _a2, _b, _c, _d;
      if ((_b = (_a2 = marketTradesSubscription.data) == null ? void 0 : _a2.market) == null ? void 0 : _b.tradeHistory) {
        return (_d = (_c = marketTradesSubscription.data) == null ? void 0 : _c.market) == null ? void 0 : _d.tradeHistory.map((item) => {
          var _a3;
          if (item) {
            item.time = (_a3 = DateTime.fromJSDate(new Date(item.time)).toRelative()) != null ? _a3 : "";
          }
          return item;
        });
      }
      return prev;
    });
  }, [marketTradesSubscription.data]);
  const cellRendererFactory = (truncate) => (val) => {
    let value = `${val.getValue()}`;
    if (truncate && value.length > 10 && Number.isNaN(Number(value))) {
      const left = value.slice(0, 5);
      const right = value.slice(value.length - 5, value.length);
      value = `${left}...${right}`;
    }
    return /* @__PURE__ */ jsx("span", {
      className: "whitespace-nowrap",
      children: value
    });
  };
  const props = {
    data: marketTrades,
    columns: [{
      accessorKey: "price",
      header: "Price",
      cell: cellRendererFactory(false)
    }, {
      accessorKey: "quantity",
      header: "Quantity",
      cell: cellRendererFactory(false)
    }, {
      accessorKey: "value",
      header: "Value",
      cell: cellRendererFactory(false)
    }],
    virtualizeOptions: {
      count: (_a = marketTrades == null ? void 0 : marketTrades.length) != null ? _a : 30,
      estimateSize: () => {
        var _a2;
        return (_a2 = marketTrades == null ? void 0 : marketTrades.length) != null ? _a2 : 30;
      },
      getScrollElement: () => tableRef.current,
      overscan: 30
    }
  };
  const tableRef = react.exports.useRef(null);
  return /* @__PURE__ */ jsx("div", {
    className: "p-0 h-full max-h-full",
    children: /* @__PURE__ */ jsx("div", {
      ref: tableRef,
      className: "flex overflow-hidden relative overflow-y-auto h-full max-h-full",
      children: /* @__PURE__ */ jsx(An, {
        ...props,
        className: "h-full"
      })
    })
  });
}
function MarketTradesContainer({}) {
  return /* @__PURE__ */ jsx(MarketTradesView, {});
}
const OrderRow = react.exports.memo(function OrderRow2({
  order,
  scale,
  side
}) {
  var _a, _b, _c;
  const controls = useAnimationControls();
  const bgColorTransforms = side === "ask" ? ["rgba(200,0,0,0)", "rgba(200,0,0,0.1)", "rgba(200,0,0,0)"] : ["rgba(0,200,0,0)", "rgba(0,200,0,0.1)", "rgba(0,200,0,0)"];
  react.exports.useEffect(() => {
    controls.start({
      backgroundColor: bgColorTransforms,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100,
        duration: 0.2
      }
    });
  }, [order == null ? void 0 : order.quantity, controls]);
  const ref = react.exports.useRef(null);
  const clientRect = (_a = ref.current) == null ? void 0 : _a.getBoundingClientRect();
  const width = (_b = clientRect == null ? void 0 : clientRect.width) != null ? _b : 0;
  const halfWidth = width / 2;
  const barWidth = scale((_c = order == null ? void 0 : order.quantity) != null ? _c : 0) * halfWidth;
  const barStyles = {
    position: "absolute",
    background: side === "ask" ? "rgba(200,0,0,0.2)" : "rgba(0,200,0,0.2)",
    height: clientRect == null ? void 0 : clientRect.height,
    width: barWidth,
    left: 0
  };
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(motion.tr, {
      style: barStyles
    }), /* @__PURE__ */ jsx(motion.tr, {
      ref,
      className: "border-b border-primary-100 dark:border-primary-700 text-primary-500 dark:text-primary-400",
      children: side === "bid" ? /* @__PURE__ */ jsxs(Fragment, {
        children: [/* @__PURE__ */ jsx(motion.td, {
          animate: controls,
          className: "text-left pl-4",
          children: order == null ? void 0 : order.quantity
        }), /* @__PURE__ */ jsx(motion.td, {
          animate: controls,
          className: "text-left pl-4 text-green-500",
          children: order == null ? void 0 : order.price
        })]
      }) : /* @__PURE__ */ jsxs(Fragment, {
        children: [/* @__PURE__ */ jsx(motion.td, {
          animate: controls,
          className: "text-left pl-4",
          children: order == null ? void 0 : order.quantity
        }), /* @__PURE__ */ jsx(motion.td, {
          animate: controls,
          className: "text-left pl-4 text-red-500",
          children: order == null ? void 0 : order.price
        })]
      })
    })]
  });
});
function OrderTable({
  items
}) {
  var _a, _b;
  const askTotals = items.map((i2) => {
    var _a2, _b2;
    return (_b2 = (_a2 = i2 == null ? void 0 : i2.ask) == null ? void 0 : _a2.quantity) != null ? _b2 : 0;
  });
  const bidTotals = items.map((i2) => {
    var _a2, _b2;
    return (_b2 = (_a2 = i2 == null ? void 0 : i2.bid) == null ? void 0 : _a2.quantity) != null ? _b2 : 0;
  });
  const scaleAsk = linear().domain([Math.min(...askTotals), Math.max(...askTotals)]).range([0, 1]);
  const scaleBid = linear().domain([Math.min(...bidTotals), Math.max(...bidTotals)]).range([0, 1]);
  const askTableRef = react.exports.useRef(null);
  const bidTableRef = react.exports.useRef(null);
  const asks = react.exports.useMemo(() => {
    var _a2;
    return ((_a2 = items.map(({
      ask
    }) => ask)) != null ? _a2 : []).sort((a2, b) => {
      var _a3, _b2;
      return ((_a3 = a2 == null ? void 0 : a2.price) != null ? _a3 : 0) < ((_b2 = b == null ? void 0 : b.price) != null ? _b2 : 0) ? 1 : -1;
    });
  }, [items]);
  const bids = react.exports.useMemo(() => {
    var _a2;
    return ((_a2 = items.map(({
      bid
    }) => bid)) != null ? _a2 : []).sort((a2, b) => {
      var _a3, _b2;
      return ((_a3 = a2 == null ? void 0 : a2.price) != null ? _a3 : 0) < ((_b2 = b == null ? void 0 : b.price) != null ? _b2 : 0) ? 1 : -1;
    });
  }, [items]);
  const renderAskRow = react.exports.useCallback((row) => {
    var _a2;
    return /* @__PURE__ */ jsx(OrderRow, {
      order: asks[row.index],
      scale: scaleAsk,
      side: "ask"
    }, (_a2 = asks[row.index]) == null ? void 0 : _a2.price);
  }, [scaleAsk, asks]);
  const askOrderTableProps = {
    data: asks,
    customRowRender: renderAskRow,
    columns: [{
      accessorKey: "ask.quantity",
      header: "Size"
    }, {
      accessorKey: "ask.price",
      header: "Price"
    }],
    virtualizeOptions: {
      count: (_a = items == null ? void 0 : items.length) != null ? _a : 10,
      estimateSize: () => {
        var _a2;
        return (_a2 = items == null ? void 0 : items.length) != null ? _a2 : 10;
      },
      getScrollElement: () => askTableRef.current,
      overscan: 10
    }
  };
  const renderBidRow = react.exports.useCallback((row) => {
    var _a2;
    return /* @__PURE__ */ jsx(OrderRow, {
      order: bids[row.index],
      scale: scaleBid,
      side: "bid"
    }, (_a2 = bids[row.index]) == null ? void 0 : _a2.price);
  }, [scaleBid, bids]);
  const bidOrderTableProps = {
    data: bids,
    customRowRender: renderBidRow,
    columns: [{
      accessorKey: "bid.quantity",
      header: "Size",
      maxSize: 150
    }, {
      accessorKey: "bid.price",
      header: "Price",
      maxSize: 150
    }],
    virtualizeOptions: {
      count: (_b = items == null ? void 0 : items.length) != null ? _b : 10,
      estimateSize: () => {
        var _a2;
        return (_a2 = items == null ? void 0 : items.length) != null ? _a2 : 10;
      },
      getScrollElement: () => bidTableRef.current,
      overscan: 10
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "h-full grid grid-rows-2 grid-cols-1",
    children: [/* @__PURE__ */ jsx("div", {
      ref: askTableRef,
      className: "relative overflow-y-scroll h-full max-h-full",
      children: /* @__PURE__ */ jsx(An, {
        ...askOrderTableProps
      })
    }), /* @__PURE__ */ jsx("div", {
      ref: bidTableRef,
      className: "relative overflow-y-scroll h-full max-h-full",
      children: /* @__PURE__ */ jsx(An, {
        ...bidOrderTableProps
      })
    })]
  });
}
const OrderBook = "";
const OrderbookDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "subscription",
    "name": {
      "kind": "Name",
      "value": "Orderbook"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "marketInputs"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "ListType",
          "type": {
            "kind": "NonNullType",
            "type": {
              "kind": "NamedType",
              "name": {
                "kind": "Name",
                "value": "MarketInput"
              }
            }
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "orderbook"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "marketInputs"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "marketInputs"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "bids"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "price"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quantity"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "asks"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "price"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "quantity"
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
const OrderBookQueryDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "OrderBookQuery"
    },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": {
        "kind": "Variable",
        "name": {
          "kind": "Name",
          "value": "marketInput"
        }
      },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "MarketInput"
          }
        }
      }
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "market"
        },
        "arguments": [{
          "kind": "Argument",
          "name": {
            "kind": "Name",
            "value": "marketInput"
          },
          "value": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "marketInput"
            }
          }
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "orderbook"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "bids"
                },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "price"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "quantity"
                    }
                  }]
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "asks"
                },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "price"
                    }
                  }, {
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "quantity"
                    }
                  }]
                }
              }]
            }
          }]
        }
      }]
    }
  }]
};
function OrderBookView(props) {
  const {
    firstCoin,
    secondCoin
  } = useCoinXYParamState();
  useQuery(OrderBookQueryDocument, {
    variables: {
      marketInput: {
        baseCoinType: firstCoin == null ? void 0 : firstCoin.coinType,
        quoteCoinType: secondCoin == null ? void 0 : secondCoin.coinType
      }
    }
  });
  const orderBookSubscription = useSubscription(OrderbookDocument, {
    variables: {
      marketInputs: [{
        baseCoinType: firstCoin == null ? void 0 : firstCoin.coinType,
        quoteCoinType: secondCoin == null ? void 0 : secondCoin.coinType
      }]
    }
  });
  const [orderItems, setOrderItems] = react.exports.useState([]);
  react.exports.useEffect(() => {
    var _a, _b, _c;
    const obd = (_a = orderBookSubscription.data) == null ? void 0 : _a.orderbook;
    const maxLen = Math.min((_b = obd == null ? void 0 : obd.asks.length) != null ? _b : 0, (_c = obd == null ? void 0 : obd.asks.length) != null ? _c : 0);
    const items = [];
    for (let i2 = 0; i2 < maxLen; i2++) {
      const ask = obd == null ? void 0 : obd.asks[i2];
      const bid = obd == null ? void 0 : obd.bids[i2];
      items.push({
        ask,
        bid
      });
    }
    if (items.length)
      setOrderItems(items);
  }, [orderBookSubscription.data]);
  return /* @__PURE__ */ jsx(OrderTable, {
    items: orderItems
  });
}
function OrderBookContainer(props) {
  return /* @__PURE__ */ jsx(OrderBookView, {
    ...props
  });
}
function e(t2, i2) {
  const n2 = { ...t2 };
  for (const o2 in i2)
    "object" != typeof t2[o2] || null === t2[o2] || Array.isArray(t2[o2]) ? void 0 !== i2[o2] && (n2[o2] = i2[o2]) : n2[o2] = e(t2[o2], i2[o2]);
  return n2;
}
const t = { mobile: { disabled_features: ["left_toolbar", "header_widget", "timeframes_toolbar", "edit_buttons_in_legend", "context_menus", "control_bar", "border_around_the_chart"], enabled_features: [] } }, i = { width: 800, height: 500, interval: "1D", timezone: "Etc/UTC", container: "", library_path: "", locale: "en", widgetbar: { details: false, watchlist: false, watchlist_settings: { default_symbols: [] } }, overrides: { "mainSeriesProperties.showCountdown": false }, studies_overrides: {}, trading_customization: { position: {}, order: {} }, brokerConfig: { configFlags: {} }, fullscreen: false, autosize: false, disabled_features: [], enabled_features: [], debug: false, logo: {}, time_frames: [{ text: "5y", resolution: "1W" }, { text: "1y", resolution: "1W" }, { text: "6m", resolution: "120" }, { text: "3m", resolution: "60" }, { text: "1m", resolution: "30" }, { text: "5d", resolution: "5" }, { text: "1d", resolution: "1" }], client_id: "0", user_id: "0", charts_storage_api_version: "1.0", favorites: { intervals: [], chartTypes: [] } };
let n = false;
function o() {
  return "CL v22.032 (internal id e2a841ff @ 2022-07-06T11:53:07.702Z)";
}
const s = class {
  constructor(o2) {
    if (this._id = `tradingview_${(1048576 * (1 + Math.random()) | 0).toString(16).substring(1)}`, this._ready = false, this._readyHandlers = [], this._onWindowResize = this._autoResizeChart.bind(this), !o2.datafeed)
      throw new Error("Datafeed is not defined");
    if (this._options = e(i, o2), o2.preset) {
      const e2 = t[o2.preset];
      e2 ? (void 0 !== this._options.disabled_features ? this._options.disabled_features = this._options.disabled_features.concat(e2.disabled_features) : this._options.disabled_features = e2.disabled_features, void 0 !== this._options.enabled_features ? this._options.enabled_features = this._options.enabled_features.concat(e2.enabled_features) : this._options.enabled_features = e2.enabled_features) : console.warn("Unknown preset: `" + o2.preset + "`");
    }
    "Dark" === this._options.theme && void 0 === this._options.loading_screen && (this._options.loading_screen = { backgroundColor: "#131722" }), this._options.debug && (n || (n = true, console.log("Using CL v22.032 (internal id e2a841ff @ 2022-07-06T11:53:07.702Z)"))), this._create();
  }
  onChartReady(e2) {
    this._ready ? e2.call(this) : this._readyHandlers.push(e2);
  }
  headerReady() {
    return this._innerWindowLoaded.then(() => this._innerWindow().headerReady());
  }
  onGrayedObjectClicked(e2) {
    this._doWhenInnerApiLoaded((t2) => {
      t2.onGrayedObjectClicked(e2);
    });
  }
  onShortcut(e2, t2) {
    this._doWhenInnerWindowLoaded((i2) => {
      i2.createShortcutAction(e2, t2);
    });
  }
  subscribe(e2, t2) {
    this._doWhenInnerApiLoaded((i2) => {
      i2.subscribe(e2, t2);
    });
  }
  unsubscribe(e2, t2) {
    this._doWhenInnerApiLoaded((i2) => {
      i2.unsubscribe(e2, t2);
    });
  }
  chart(e2) {
    return this._innerAPI().chart(e2);
  }
  getLanguage() {
    return this._options.locale;
  }
  setSymbol(e2, t2, i2) {
    this._innerAPI().changeSymbol(e2, t2, i2);
  }
  remove() {
    window.removeEventListener("resize", this._onWindowResize), this._readyHandlers.splice(0, this._readyHandlers.length), delete window[this._id], this._iFrame.parentNode && this._iFrame.parentNode.removeChild(this._iFrame);
  }
  closePopupsAndDialogs() {
    this._doWhenInnerApiLoaded((e2) => {
      e2.closePopupsAndDialogs();
    });
  }
  selectLineTool(e2) {
    this._innerAPI().selectLineTool(e2);
  }
  selectedLineTool() {
    return this._innerAPI().selectedLineTool();
  }
  save(e2) {
    this._innerAPI().saveChart(e2);
  }
  load(e2, t2) {
    this._innerAPI().loadChart({ json: e2, extendedData: t2 });
  }
  getSavedCharts(e2) {
    this._innerAPI().getSavedCharts(e2);
  }
  loadChartFromServer(e2) {
    this._innerAPI().loadChartFromServer(e2);
  }
  saveChartToServer(e2, t2, i2) {
    this._innerAPI().saveChartToServer(e2, t2, i2);
  }
  removeChartFromServer(e2, t2) {
    this._innerAPI().removeChartFromServer(e2, t2);
  }
  onContextMenu(e2) {
    this._doWhenInnerApiLoaded((t2) => {
      t2.onContextMenu(e2);
    });
  }
  createButton(e2) {
    return this._innerWindow().createButton(e2);
  }
  createDropdown(e2) {
    return this._innerWindow().createDropdown(e2);
  }
  showNoticeDialog(e2) {
    this._doWhenInnerApiLoaded((t2) => {
      t2.showNoticeDialog(e2);
    });
  }
  showConfirmDialog(e2) {
    this._doWhenInnerApiLoaded((t2) => {
      t2.showConfirmDialog(e2);
    });
  }
  showLoadChartDialog() {
    this._innerAPI().showLoadChartDialog();
  }
  showSaveAsChartDialog() {
    this._innerAPI().showSaveAsChartDialog();
  }
  symbolInterval() {
    return this._innerAPI().getSymbolInterval();
  }
  mainSeriesPriceFormatter() {
    return this._innerAPI().mainSeriesPriceFormatter();
  }
  getIntervals() {
    return this._innerAPI().getIntervals();
  }
  getStudiesList() {
    return this._innerAPI().getStudiesList();
  }
  getStudyInputs(e2) {
    return this._innerAPI().getStudyInputs(e2);
  }
  addCustomCSSFile(e2) {
    this._innerWindow().addCustomCSSFile(e2);
  }
  applyOverrides(t2) {
    this._options = e(this._options, { overrides: t2 }), this._doWhenInnerWindowLoaded((e2) => {
      e2.applyOverrides(t2);
    });
  }
  applyStudiesOverrides(e2) {
    this._doWhenInnerWindowLoaded((t2) => {
      t2.applyStudiesOverrides(e2);
    });
  }
  watchList() {
    return this._innerAPI().watchlist();
  }
  news() {
    return this._innerAPI().news();
  }
  widgetbar() {
    return this._innerAPI().widgetbar();
  }
  activeChart() {
    return this._innerAPI().activeChart();
  }
  chartsCount() {
    return this._innerAPI().chartsCount();
  }
  layout() {
    return this._innerAPI().layout();
  }
  setLayout(e2) {
    this._innerAPI().setLayout(e2);
  }
  layoutName() {
    return this._innerAPI().layoutName();
  }
  changeTheme(e2, t2) {
    return this._innerWindow().changeTheme(e2, t2);
  }
  getTheme() {
    return this._innerWindow().getTheme();
  }
  takeScreenshot() {
    this._doWhenInnerApiLoaded((e2) => {
      e2.takeScreenshot();
    });
  }
  lockAllDrawingTools() {
    return this._innerAPI().lockAllDrawingTools();
  }
  hideAllDrawingTools() {
    return this._innerAPI().hideAllDrawingTools();
  }
  drawOnAllCharts(e2) {
    this._innerAPI().drawOnAllCharts(e2);
  }
  magnetEnabled() {
    return this._innerAPI().magnetEnabled();
  }
  magnetMode() {
    return this._innerAPI().magnetMode();
  }
  undoRedoState() {
    return this._innerAPI().undoRedoState();
  }
  setIntervalLinkingEnabled(e2) {
    this._innerAPI().setIntervalLinkingEnabled(e2);
  }
  setTimeFrame(e2) {
    this._innerAPI().setTimeFrame(e2);
  }
  symbolSync() {
    return this._innerAPI().symbolSync();
  }
  intervalSync() {
    return this._innerAPI().intervalSync();
  }
  crosshairSync() {
    return this._innerAPI().crosshairSync();
  }
  timeSync() {
    return this._innerAPI().timeSync();
  }
  getAllFeatures() {
    return this._innerWindow().getAllFeatures();
  }
  clearUndoHistory() {
    return this._innerAPI().clearUndoHistory();
  }
  undo() {
    return this._innerAPI().undo();
  }
  redo() {
    return this._innerAPI().redo();
  }
  startFullscreen() {
    this._innerAPI().startFullscreen();
  }
  exitFullscreen() {
    this._innerAPI().exitFullscreen();
  }
  takeClientScreenshot(e2) {
    return this._innerAPI().takeClientScreenshot(e2);
  }
  navigationButtonsVisibility() {
    return this._innerWindow().getNavigationButtonsVisibility();
  }
  paneButtonsVisibility() {
    return this._innerWindow().getPaneButtonsVisibility();
  }
  dateFormat() {
    return this._innerWindow().getDateFormat();
  }
  _innerAPI() {
    return this._innerWindow().tradingViewApi;
  }
  _innerWindow() {
    return this._iFrame.contentWindow;
  }
  _doWhenInnerWindowLoaded(e2) {
    this._ready ? e2(this._innerWindow()) : this._innerWindowLoaded.then(() => {
      e2(this._innerWindow());
    });
  }
  _doWhenInnerApiLoaded(e2) {
    this._doWhenInnerWindowLoaded((t2) => {
      t2.doWhenApiIsReady(() => e2(this._innerAPI()));
    });
  }
  _autoResizeChart() {
    this._options.fullscreen && (this._iFrame.style.height = window.innerHeight + "px");
  }
  _create() {
    const e2 = this._render();
    this._options.container_id && console.warn("`container_id` is now deprecated. Please use `container` instead to either still pass a string or an `HTMLElement`.");
    const t2 = this._options.container_id || this._options.container, i2 = "string" == typeof t2 ? document.getElementById(t2) : t2;
    if (null === i2)
      throw new Error(`There is no such element - #${this._options.container}`);
    i2.innerHTML = e2, this._iFrame = i2.querySelector(`#${this._id}`);
    const n2 = this._iFrame;
    (this._options.autosize || this._options.fullscreen) && (n2.style.width = "100%", this._options.fullscreen || (n2.style.height = "100%")), window.addEventListener("resize", this._onWindowResize), this._onWindowResize(), this._innerWindowLoaded = new Promise((e3) => {
      const t3 = () => {
        n2.removeEventListener("load", t3, false), e3();
      };
      n2.addEventListener("load", t3, false);
    }), this._innerWindowLoaded.then(() => {
      this._innerWindow().widgetReady(() => {
        this._ready = true;
        for (const e3 of this._readyHandlers)
          try {
            e3.call(this);
          } catch (e4) {
            console.error(e4);
          }
        this._innerWindow().initializationFinished();
      });
    });
  }
  _render() {
    const e2 = window;
    if (e2[this._id] = { datafeed: this._options.datafeed, customFormatters: this._options.custom_formatters || this._options.customFormatters, brokerFactory: this._options.broker_factory || this._options.brokerFactory, overrides: this._options.overrides, studiesOverrides: this._options.studies_overrides, tradingCustomization: this._options.trading_customization, disabledFeatures: this._options.disabled_features, enabledFeatures: this._options.enabled_features, brokerConfig: this._options.broker_config || this._options.brokerConfig, restConfig: this._options.restConfig, favorites: this._options.favorites, logo: this._options.logo, numeric_formatting: this._options.numeric_formatting, rss_news_feed: this._options.rss_news_feed, newsProvider: this._options.news_provider, loadLastChart: this._options.load_last_chart, saveLoadAdapter: this._options.save_load_adapter, loading_screen: this._options.loading_screen, settingsAdapter: this._options.settings_adapter, getCustomIndicators: this._options.custom_indicators_getter, additionalSymbolInfoFields: this._options.additional_symbol_info_fields, headerWidgetButtonsMode: this._options.header_widget_buttons_mode, customTranslateFunction: this._options.custom_translate_function, symbolSearchComplete: this._options.symbol_search_complete, contextMenu: this._options.context_menu, settingsOverrides: this._options.settings_overrides }, this._options.saved_data)
      e2[this._id].chartContent = { json: this._options.saved_data }, this._options.saved_data_meta_info && (e2[this._id].chartContentExtendedData = this._options.saved_data_meta_info);
    else if (!this._options.load_last_chart && !this._options.symbol)
      throw new Error("Symbol is not defined: either 'symbol' or 'load_last_chart' option must be set");
    const t2 = (this._options.library_path || "") + `${encodeURIComponent(this._options.locale)}-tv-chart.e2a841ff.html#symbol=` + encodeURIComponent(this._options.symbol || "") + "&interval=" + encodeURIComponent(this._options.interval) + (this._options.timeframe ? "&timeframe=" + encodeURIComponent(this._options.timeframe) : "") + (this._options.toolbar_bg ? "&toolbarbg=" + encodeURIComponent(this._options.toolbar_bg.replace("#", "")) : "") + (this._options.studies_access ? "&studiesAccess=" + encodeURIComponent(JSON.stringify(this._options.studies_access)) : "") + "&widgetbar=" + encodeURIComponent(JSON.stringify(this._options.widgetbar)) + (this._options.drawings_access ? "&drawingsAccess=" + encodeURIComponent(JSON.stringify(this._options.drawings_access)) : "") + "&timeFrames=" + encodeURIComponent(JSON.stringify(this._options.time_frames)) + "&locale=" + encodeURIComponent(this._options.locale) + "&uid=" + encodeURIComponent(this._id) + "&clientId=" + encodeURIComponent(String(this._options.client_id)) + "&userId=" + encodeURIComponent(String(this._options.user_id)) + (this._options.charts_storage_url ? "&chartsStorageUrl=" + encodeURIComponent(this._options.charts_storage_url) : "") + (this._options.charts_storage_api_version ? "&chartsStorageVer=" + encodeURIComponent(this._options.charts_storage_api_version) : "") + (this._options.custom_css_url ? "&customCSS=" + encodeURIComponent(this._options.custom_css_url) : "") + (this._options.custom_font_family ? "&customFontFamily=" + encodeURIComponent(this._options.custom_font_family) : "") + (this._options.auto_save_delay ? "&autoSaveDelay=" + encodeURIComponent(String(this._options.auto_save_delay)) : "") + "&debug=" + encodeURIComponent(String(this._options.debug)) + (this._options.snapshot_url ? "&snapshotUrl=" + encodeURIComponent(this._options.snapshot_url) : "") + (this._options.timezone ? "&timezone=" + encodeURIComponent(this._options.timezone) : "") + (this._options.study_count_limit ? "&studyCountLimit=" + encodeURIComponent(String(this._options.study_count_limit)) : "") + (this._options.symbol_search_request_delay ? "&ssreqdelay=" + encodeURIComponent(String(this._options.symbol_search_request_delay)) : "") + (this._options.compare_symbols ? "&compareSymbols=" + encodeURIComponent(JSON.stringify(this._options.compare_symbols)) : "") + (this._options.theme ? "&theme=" + encodeURIComponent(String(this._options.theme)) : "") + (this._options.header_widget_buttons_mode ? "&header_widget_buttons_mode=" + encodeURIComponent(String(this._options.header_widget_buttons_mode)) : "") + (this._options.time_scale ? "&time_scale=" + encodeURIComponent(JSON.stringify(this._options.time_scale)) : "");
    return '<iframe id="' + this._id + '" name="' + this._id + '"  src="' + t2 + '"' + (this._options.autosize || this._options.fullscreen ? "" : ' width="' + this._options.width + '" height="' + this._options.height + '"') + ' title="Financial Chart" frameborder="0" allowTransparency="true" scrolling="no" allowfullscreen style="display:block;"></iframe>';
  }
};
window.TradingView = window.TradingView || {}, window.TradingView.version = o;
function useCreateTradingView() {
  const datafeed = useDataFeed();
  const [symbol, setSymbol] = react.exports.useState();
  const [interval, setInterval2] = react.exports.useState("1D");
  ({
    "paneProperties.backgroundType": "solid",
    "paneProperties.background": "rgba(15, 23, 42, 0.8)",
    toolbar_bg: "green",
    "mainSeriesProperties.candleStyle.upColor": colors_1.green[500],
    "mainSeriesProperties.candleStyle.downColor": colors_1.red[500],
    "mainSeriesProperties.candleStyle.borderColor": "var(--secondary-500)",
    "mainSeriesProperties.candleStyle.borderUpColor": colors_1.green[500],
    "mainSeriesProperties.candleStyle.borderDownColor": colors_1.red[500],
    "mainSeriesProperties.candleStyle.wickColor": "var(--secondary-500)",
    "mainSeriesProperties.candleStyle.wickUpColor": colors_1.green[500],
    "mainSeriesProperties.candleStyle.wickDownColor": colors_1.red[500],
    "mainSeriesProperties.hollowCandleStyle.upColor": colors_1.green[500],
    "mainSeriesProperties.hollowCandleStyle.downColor": colors_1.red[500],
    "mainSeriesProperties.hollowCandleStyle.borderColor": "var(--secondary-500)",
    "mainSeriesProperties.hollowCandleStyle.borderUpColor": colors_1.green[500],
    "mainSeriesProperties.hollowCandleStyle.borderDownColor": colors_1.red[500],
    "mainSeriesProperties.hollowCandleStyle.wickColor": "var(--secondary-500)",
    "mainSeriesProperties.hollowCandleStyle.wickUpColor": colors_1.green[500],
    "mainSeriesProperties.hollowCandleStyle.wickDownColor": colors_1.red[500],
    "mainSeriesProperties.haStyle.upColor": colors_1.green[500],
    "mainSeriesProperties.haStyle.downColor": colors_1.red[500],
    "mainSeriesProperties.haStyle.borderColor": "var(--secondary-500)",
    "mainSeriesProperties.haStyle.borderUpColor": colors_1.green[500],
    "mainSeriesProperties.haStyle.borderDownColor": colors_1.red[500],
    "mainSeriesProperties.haStyle.wickColor": "var(--secondary-500)",
    "mainSeriesProperties.haStyle.wickUpColor": colors_1.green[500],
    "mainSeriesProperties.haStyle.wickDownColor": colors_1.red[500],
    "mainSeriesProperties.barStyle.upColor": colors_1.green[600],
    "mainSeriesProperties.barStyle.downColor": colors_1.red[600],
    "mainSeriesProperties.lineStyle.color": "var(--secondary-600)",
    "mainSeriesProperties.areaStyle.color1": "rgba(59,130,246, 0.3)",
    "mainSeriesProperties.areaStyle.color2": "var(--secondary-600)",
    "mainSeriesProperties.areaStyle.linecolor": "var(--secondary-600)",
    "mainSeriesProperties.baselineStyle.topFillColor1": "rgba(34, 197, 94, 0.3)",
    "mainSeriesProperties.baselineStyle.topFillColor2": "rgba(34, 197, 94, 0.05)",
    "mainSeriesProperties.baselineStyle.bottomFillColor1": "rgba(239, 68, 68, 0.3)",
    "mainSeriesProperties.baselineStyle.bottomFillColor2": "rgba(239, 68, 68, 0.05)",
    "mainSeriesProperties.baselineStyle.topLineColor": colors_1.green[500],
    "mainSeriesProperties.baselineStyle.bottomLineColor": colors_1.red[500]
  });
  react.exports.useEffect(() => {
    if (symbol) {
      window.tvWidget = new s({
        symbol,
        interval,
        locale: "en",
        autosize: true,
        custom_css_url: "/charts.css",
        fullscreen: false,
        container: "tv_chart_container",
        datafeed,
        theme: "Dark",
        library_path: "/charting_library/",
        disabled_features: ["left_toolbar"],
        loading_screen: {
          backgroundColor: "#000011",
          foregroundColor: "var(--secondary-600)"
        }
      }).applyOverrides(window.tv_overrides);
    }
  }, [symbol, interval]);
  return ({
    symbol: symbol2,
    interval: interval2
  }) => {
    setSymbol(symbol2);
    setInterval2(interval2);
  };
}
function useTradeControls() {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const balances = useBalances();
  const {
    firstCoin,
    secondCoin,
    lastTradePrice
  } = useCoinXYParamState();
  const quantX = (_d = (_c = (_b = (_a = balances.data) == null ? void 0 : _a.account) == null ? void 0 : _b.balances) == null ? void 0 : _c.find((b) => b.coinInfo.symbol === firstCoin.symbol)) == null ? void 0 : _d.availableBalance;
  const [activeTab, setActiveTab] = react.exports.useState(0);
  const [price, setPrice] = react.exports.useState(lastTradePrice);
  const [cxAmount, setCxAmount] = react.exports.useState(0);
  const [cyAmount, setCyAmount] = react.exports.useState(0);
  const [post, setPost] = react.exports.useState(false);
  const [ioc, setIOC] = react.exports.useState(false);
  const [fok, setFok] = react.exports.useState(false);
  const [orderType, setOrderType] = react.exports.useState(OrderType.Limit);
  const market = useQuery(MarketSimpleDocument, {
    variables: {
      marketInput: {
        baseCoinType: firstCoin == null ? void 0 : firstCoin.coinType,
        quoteCoinType: secondCoin == null ? void 0 : secondCoin.coinType
      }
    },
    skip: !firstCoin || !secondCoin
  });
  const pythRatingQuery = useQuery(PythRatingDocument, {
    variables: {
      marketInput: {
        baseCoinType: firstCoin == null ? void 0 : firstCoin.coinType,
        quoteCoinType: secondCoin == null ? void 0 : secondCoin.coinType
      },
      price,
      side: !activeTab ? Side.Buy : Side.Sell
    },
    skip: !firstCoin || !secondCoin
  });
  const pythRating = (_f = (_e = pythRatingQuery.data) == null ? void 0 : _e.market) == null ? void 0 : _f.pythRating;
  const lotSize = react.exports.useMemo(() => {
    var _a2, _b2, _c2;
    return (_c2 = (_b2 = (_a2 = market.data) == null ? void 0 : _a2.market) == null ? void 0 : _b2.lotSize) != null ? _c2 : 0;
  }, [(_h = (_g = market.data) == null ? void 0 : _g.market) == null ? void 0 : _h.lotSize]);
  const dec = react.exports.useMemo(() => {
    var _a2;
    return Math.pow(10, ((_a2 = firstCoin == null ? void 0 : firstCoin.decimals) != null ? _a2 : 0) * -1);
  }, [firstCoin]);
  const step = react.exports.useMemo(() => lotSize * dec, [lotSize, dec]);
  const setPctFactory = (n2) => () => {
    if (quantX)
      setCxAmount(quantX * n2);
  };
  const set25 = setPctFactory(0.25);
  const set50 = setPctFactory(0.5);
  const set75 = setPctFactory(0.75);
  const setMax = setPctFactory(1);
  const resetForm = () => {
    setActiveTab(0);
    setPrice(0);
    setCxAmount(0);
    setCyAmount(0);
    setPost(false);
    setIOC(false);
    setOrderType(OrderType.Limit);
  };
  const checkSetLimit = (switchVals) => {
    if (!switchVals.filter(Boolean).length)
      setOrderType(OrderType.Limit);
  };
  const onChangeIOC = (val) => {
    if (post && val)
      setPost(false);
    if (fok && val)
      setFok(false);
    setIOC(val);
    setOrderType(OrderType.ImmediateOrCancel);
    checkSetLimit([post, fok, val]);
  };
  const onChangePost = (val) => {
    if (ioc && val)
      setIOC(false);
    if (fok && val)
      setFok(false);
    setPost(val);
    setOrderType(OrderType.PostOnly);
    checkSetLimit([ioc, fok, val]);
  };
  const onChangeFok = (val) => {
    if (ioc && val)
      setIOC(false);
    if (post && val)
      setPost(false);
    setFok(val);
    setOrderType(OrderType.FillOrKill);
    checkSetLimit([post, ioc, val]);
  };
  const onChangePrice = react.exports.useCallback((e2) => {
    setPrice(Number(e2.currentTarget.value));
  }, []);
  const onChangeCxAmount = react.exports.useCallback((e2) => setCxAmount(Number(e2.currentTarget.value)), []);
  const onChangeCyAmount = react.exports.useCallback((e2) => setCyAmount(Number(e2.currentTarget.value)), []);
  const [placeOrderMutation] = useMutation(PlaceOrderDocument);
  const [wallet, , connection] = useWallet();
  const placeOrder = async (placeOrderInput) => {
    var _a2;
    const tx = await placeOrderMutation({
      variables: {
        placeOrderInput
      }
    });
    await (wallet == null ? void 0 : wallet.signAndSubmitTransaction((_a2 = tx.data) == null ? void 0 : _a2.placeOrder));
  };
  const {
    addNotification
  } = Lt();
  const submitTrade = async () => {
    if (firstCoin && secondCoin && connection) {
      await placeOrder({
        auxToBurn: 0,
        clientOrderId: 0,
        orderType,
        limitPrice: price.toString(),
        marketInput: {
          baseCoinType: firstCoin == null ? void 0 : firstCoin.coinType,
          quoteCoinType: secondCoin == null ? void 0 : secondCoin.coinType
        },
        quantity: cxAmount.toString(),
        sender: connection == null ? void 0 : connection.address,
        side: activeTab === 0 ? Side.Buy : Side.Sell
      }).then((x) => {
        resetForm();
        addNotification({
          message: "Trade Submitted",
          title: "Success",
          type: "info",
          id: "1"
        });
      }).catch((err) => {
        addNotification({
          title: "Error",
          type: "error",
          id: "1",
          message: "There was an issue processing your trade"
        });
      });
    }
  };
  return {
    cxAmount,
    onChangeCxAmount,
    price,
    onChangePrice,
    post,
    onChangePost,
    ioc,
    onChangeIOC,
    cyAmount,
    onChangeCyAmount,
    activeTab,
    submitTrade,
    onChangeOrderType: setOrderType,
    orderType,
    setActiveTab,
    fok,
    onChangeFok,
    set25,
    set50,
    set75,
    setMax,
    quantX,
    step,
    pythRating
  };
}
function TradingForm() {
  const {
    ioc,
    onChangeIOC,
    post,
    onChangePost,
    onChangeCxAmount,
    onChangeCyAmount,
    cxAmount,
    onChangeOrderType,
    orderType,
    cyAmount,
    price: priceInput,
    onChangePrice,
    setActiveTab,
    activeTab,
    submitTrade,
    fok,
    onChangeFok,
    set25,
    set50,
    set75,
    setMax,
    step,
    pythRating
  } = useTradeControls();
  const {
    firstCoin,
    secondCoin
  } = useCoinXYParamState();
  const tabs = [{
    label: "Buy",
    variant: "buy"
  }, {
    label: "Sell",
    variant: "sell"
  }];
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col w-full h-full gap-3 px-4",
    children: [/* @__PURE__ */ jsx(Ge$1.Group, {
      onChange: setActiveTab,
      selectedIndex: activeTab,
      children: /* @__PURE__ */ jsx(jn, {
        tabs
      })
    }), /* @__PURE__ */ jsx("div", {
      children: /* @__PURE__ */ jsx($n, {
        className: "w-full",
        value: priceInput,
        onChange: onChangePrice,
        name: "price",
        label: "Price",
        suffix: /* @__PURE__ */ jsx("div", {
          className: "mr-[60px]",
          children: secondCoin == null ? void 0 : secondCoin.symbol
        }),
        inputMode: "decimal",
        type: "number"
      })
    }), /* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx($n, {
        value: cxAmount,
        onChange: onChangeCxAmount,
        name: "coinx",
        label: "Amount",
        suffix: /* @__PURE__ */ jsx("div", {
          className: "mr-[60px]",
          children: firstCoin == null ? void 0 : firstCoin.symbol
        }),
        className: "w-full",
        inputMode: "decimal",
        type: "number",
        step
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex w-full gap-2 pt-2",
        children: [/* @__PURE__ */ jsx(qe, {
          size: "xs",
          variant: "basic",
          onClick: set25,
          children: "25%"
        }), /* @__PURE__ */ jsx(qe, {
          size: "xs",
          variant: "basic",
          onClick: set50,
          children: "50%"
        }), /* @__PURE__ */ jsx(qe, {
          size: "xs",
          variant: "basic",
          onClick: set75,
          children: "75%"
        }), /* @__PURE__ */ jsx(qe, {
          size: "xs",
          variant: "basic",
          onClick: setMax,
          children: "Max"
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "grid gap-6 my-2 grid-row-2 grid-col-2",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-start gap-2",
        children: [/* @__PURE__ */ jsx(Fn, {
          enabled: ioc,
          onChange: onChangeIOC
        }), "Immediate Or Cancel"]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-start gap-2",
        children: [/* @__PURE__ */ jsx(Fn, {
          enabled: post,
          onChange: onChangePost
        }), "Post"]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-start gap-2",
        children: [/* @__PURE__ */ jsx(Fn, {
          enabled: fok,
          onChange: onChangeFok
        }), "Fill or Kill"]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col py-3 border-t border-t-primary-700 gap-2",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex justify-between text-primary-400 text-sm",
        children: [/* @__PURE__ */ jsx("div", {
          className: "font-medium",
          children: "Price Protection by Pyth:"
        }), /* @__PURE__ */ jsx("div", {
          className: `font-medium ${(pythRating == null ? void 0 : pythRating.color) === "GREEN" ? "text-green-300" : (pythRating == null ? void 0 : pythRating.color) === "YELLOW" ? "text-yellow-300" : (pythRating == null ? void 0 : pythRating.color) === "RED" ? "text-red-300" : ""}`,
          children: (pythRating == null ? void 0 : pythRating.color) === "GREEN" ? "Good Price" : (pythRating == null ? void 0 : pythRating.color) === "YELLOW" ? "High Price" : (pythRating == null ? void 0 : pythRating.color) === "RED" ? "High Price" : ""
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex justify-between text-primary-400 text-sm",
        children: [/* @__PURE__ */ jsx("div", {
          className: "font-medium",
          children: "Subtotal"
        }), /* @__PURE__ */ jsx("div", {
          className: "font-semibold",
          children: (priceInput * cxAmount).toLocaleString()
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex justify-between text-primary-400 text-sm",
        children: [/* @__PURE__ */ jsx("div", {
          className: "font-medium",
          children: "Fee"
        }), /* @__PURE__ */ jsx("div", {
          className: "font-semibold",
          children: "Zero! \u263A"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex justify-between text-lg border-t border-t-primary-700 pt-3",
        children: [/* @__PURE__ */ jsx("div", {
          className: "font-medium",
          children: "Total"
        }), /* @__PURE__ */ jsx("div", {
          className: "font-bold",
          children: (priceInput * cxAmount).toLocaleString()
        })]
      })]
    }), /* @__PURE__ */ jsx(qe, {
      onClick: submitTrade,
      size: "sm",
      children: "Submit Trade"
    })]
  });
}
function usePositionsTable() {
  var _a, _b, _c, _d, _e, _f, _g;
  const positions = usePositions();
  const tableRef = react.exports.useRef(null);
  const tableProps = {
    loading: positions.loading,
    error: (_a = positions.error) == null ? void 0 : _a.message,
    noData: "You have no open positions.",
    data: (_d = (_c = (_b = positions.data) == null ? void 0 : _b.account) == null ? void 0 : _c.poolPositions) != null ? _d : [],
    columns: [{
      accessorKey: "coinInfoX.symbol",
      header: "Coin X"
    }, {
      accessorKey: "coinInfoY.symbol",
      header: "Coin Y"
    }, {
      accessorKey: "amountLP",
      header: "Amount LP"
    }, {
      accessorKey: "amountX",
      header: "Amount X"
    }, {
      accessorKey: "amountY",
      header: "Amount Y"
    }, {
      accessorKey: "share",
      header: "Share"
    }],
    virtualizeOptions: {
      count: (_g = (_f = (_e = positions.data) == null ? void 0 : _e.account) == null ? void 0 : _f.poolPositions.length) != null ? _g : 0,
      estimateSize: () => {
        var _a2, _b2, _c2;
        return (_c2 = (_b2 = (_a2 = positions.data) == null ? void 0 : _a2.account) == null ? void 0 : _b2.poolPositions.length) != null ? _c2 : 0;
      },
      getScrollElement: () => tableRef.current
    }
  };
  return [tableProps, tableRef];
}
function TradeView({}) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const createTradingView = useCreateTradingView();
  const {
    firstCoin,
    secondCoin,
    lastTradePrice
  } = useCoinXYParamState();
  const [, , connection] = useWallet();
  const marketQuery = useQuery(MarketDocument, {
    variables: {
      marketInput: {
        baseCoinType: firstCoin == null ? void 0 : firstCoin.coinType,
        quoteCoinType: secondCoin == null ? void 0 : secondCoin.coinType
      },
      owner: connection == null ? void 0 : connection.address
    },
    skip: !firstCoin || !secondCoin
  });
  const [priceDirection, setPriceDirection] = react.exports.useState("up");
  const lastPriceRef = react.exports.useRef(lastTradePrice);
  const [priceDiff, setPriceDiff] = react.exports.useState(0);
  const [priceDiffPct, setPriceDiffPct] = react.exports.useState(0);
  react.exports.useEffect(() => {
    const s2 = Math.sign(lastTradePrice - lastPriceRef.current);
    const _priceDiffPct = Math.abs(1 - lastTradePrice / lastPriceRef.current);
    const _priceDiff = Math.abs(lastTradePrice - lastPriceRef.current);
    if (_priceDiff && !Number.isNaN(_priceDiff))
      setPriceDiff(_priceDiff);
    if (_priceDiffPct && _priceDiffPct !== Infinity && !Number.isNaN(_priceDiffPct))
      setPriceDiffPct(Number(_priceDiffPct));
    if (s2 < 0)
      setPriceDirection("down");
    if (s2 > 0)
      setPriceDirection("up");
    lastPriceRef.current = lastTradePrice;
  }, [lastTradePrice]);
  const onSelectMarket = (m) => {
    createTradingView({
      symbol: m.name,
      interval: "1D"
    });
    setPriceDiff(0);
    setPriceDiffPct(0);
    lastPriceRef.current = 0;
  };
  const orderTableTabs = [{
    label: "Open Orders"
  }, {
    label: "Order History"
  }, {
    label: "Trade History"
  }, {
    label: "Balances"
  }];
  const [orderTableTab, setOrderTableTab] = react.exports.useState(3);
  const marketEventTabs = [{
    label: "Order Book"
  }, {
    label: "Market Trades"
  }];
  const [marketEventTab, setMarketEventTab] = react.exports.useState(0);
  usePositionsTable();
  const [, openOrderTableRef] = useOpenOrdersTable();
  const [, orderHistoryTableRef] = useOrderHistoryTable();
  const [, tradeHistoryTableRef] = useTradeHistoryTable();
  const [, balanceTableRef] = useBalancesTable();
  function getTableRef(tab) {
    switch (tab) {
      case 0:
        return openOrderTableRef;
      case 1:
        return orderHistoryTableRef;
      case 2:
        return tradeHistoryTableRef;
      case 3:
        return balanceTableRef;
      default:
        return balanceTableRef;
    }
  }
  return /* @__PURE__ */ jsxs("div", {
    className: " bg-primary-900 w-full grid sm:grid-cols-1 sm:grid-rows-5 md:grid-rows-[76px_1fr_1fr_300px] md:grid-cols-[275px_275px_1fr_1fr_1fr_1fr] overflow-hidden",
    children: [/* @__PURE__ */ jsxs("div", {
      className: " sm:col-span-1 md:col-span-1 sm:row-span-1 md:row-span-4 h-full md:border-r md:border-r-primary-700",
      children: [/* @__PURE__ */ jsx("div", {
        className: "flex px-4 py-2.5 w-full",
        children: /* @__PURE__ */ jsx(MarketSelector, {
          onSelectMarket
        })
      }), /* @__PURE__ */ jsx(TradingForm, {})]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex items-center md:col-span-5",
      children: [/* @__PURE__ */ jsx(Pn, {
        title: "",
        value: lastTradePrice,
        priceDirection,
        valueChange: priceDiff,
        percentChange: priceDiffPct,
        className: "mx-1 ml-1"
      }), /* @__PURE__ */ jsx(Pn, {
        title: "24hr High",
        value: (_c = (_b = (_a = marketQuery.data) == null ? void 0 : _a.market) == null ? void 0 : _b.high24h) != null ? _c : "-",
        className: "mx-1"
      }), /* @__PURE__ */ jsx(Pn, {
        title: "24hr Low",
        value: (_f = (_e = (_d = marketQuery.data) == null ? void 0 : _d.market) == null ? void 0 : _e.low24h) != null ? _f : "-",
        className: "mx-1"
      }), /* @__PURE__ */ jsx(Pn, {
        title: "24hr Volume",
        value: (_i = (_h = (_g = marketQuery.data) == null ? void 0 : _g.market) == null ? void 0 : _h.volume24h) != null ? _i : "-",
        className: "ml-1"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: " md:col-span-1 md:row-span-4 h-full md:border-r md:border-t md:border-t-primary-700 md:border-r-primary-700",
      children: [/* @__PURE__ */ jsx(Ge$1.Group, {
        selectedIndex: marketEventTab,
        onChange: setMarketEventTab,
        children: /* @__PURE__ */ jsx(jn, {
          tabs: marketEventTabs
        })
      }), marketEventTab === 0 ? /* @__PURE__ */ jsx(OrderBookContainer, {
        price: lastTradePrice,
        priceDirection,
        symbol: "BTC-USD",
        baseCoinType: (_j = firstCoin == null ? void 0 : firstCoin.coinType) != null ? _j : "",
        quoteCoinType: (_k = secondCoin == null ? void 0 : secondCoin.coinType) != null ? _k : ""
      }) : null, marketEventTab === 1 ? /* @__PURE__ */ jsx(MarketTradesContainer, {}) : null]
    }), /* @__PURE__ */ jsx("div", {
      id: "tv_chart_container",
      style: {
        minHeight: 300
      },
      className: "bg-primary-900 min-h-full sm:col-span-1 md:col-span-4 sm:row-span-1 md:row-span-2 h-full min-w-full overflow-hidden md:border-y md:border-y-primary-700"
    }), /* @__PURE__ */ jsxs("div", {
      className: " sm:col-span-1 md:col-span-4 md:row-span-1 w-full max-h-full h-full",
      children: [/* @__PURE__ */ jsx(Ge$1.Group, {
        selectedIndex: orderTableTab,
        onChange: setOrderTableTab,
        children: /* @__PURE__ */ jsx(jn, {
          tabs: orderTableTabs
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "max-w-full w-full h-full overflow-y-auto max-h-[250px]",
        ref: getTableRef(orderTableTab),
        children: [orderTableTab === 0 && /* @__PURE__ */ jsx(OrdersTable, {
          variant: "open"
        }), orderTableTab === 1 && /* @__PURE__ */ jsx(OrdersTable, {}), orderTableTab === 2 && /* @__PURE__ */ jsx(TradeTable, {}), orderTableTab === 3 && /* @__PURE__ */ jsx(BalancesTable, {})]
      })]
    })]
  });
}
function TradeContainer({}) {
  return /* @__PURE__ */ jsx(DataFeedProvider, {
    children: /* @__PURE__ */ jsx(TradeView, {})
  });
}
const AllPoolsDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "AllPools"
    },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "pools"
        },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "coinInfoX"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "coinInfoY"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "coinInfoLP"
            },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "coinType"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "decimals"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "name"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "symbol"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "amountX"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "amountY"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "amountLP"
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "feePercent"
            }
          }]
        }
      }]
    }
  }]
};
const Pools = "";
function PoolsView({
  pools,
  goToAddLiquidity,
  goToRemoveLiquidity,
  goToPoolInfo
}) {
  var _a;
  const NO_POOLS_UI = /* @__PURE__ */ jsx(Dn, {
    className: "text-center mt-[200px] max-w-[400px] self-center border-primary-700 border",
    children: "No Pools Available"
  });
  const renderLiquidityItem = (pool) => {
    return /* @__PURE__ */ jsxs(Dn, {
      className: "flex justify-between hover:bg-primary-900/70 hover:cursor-pointer border-primary-700 border",
      onClick: () => goToPoolInfo(pool.coinInfoX, pool.coinInfoY),
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex items-center",
          children: /* @__PURE__ */ jsx(Tn, {
            coins: [pool.coinInfoX.symbol, pool.coinInfoY.symbol],
            size: 48
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "self-center ml-4 text-xl",
          children: `${pool.coinInfoX.name} / ${pool.coinInfoY.name}`
        })]
      }), /* @__PURE__ */ jsx(Pn, {
        title: `${pool.coinInfoX.name} Locked`,
        value: pool.amountX
      }), /* @__PURE__ */ jsx(Pn, {
        title: `${pool.coinInfoY.name} Locked`,
        value: pool.amountY
      }), /* @__PURE__ */ jsx(Pn, {
        title: "Fee Perecent",
        value: (pool == null ? void 0 : pool.feePercent) ? `${pool.feePercent}%` : "-"
      }), /* @__PURE__ */ jsx(qe, {
        size: "sm",
        className: "h-auto self-center",
        onClick: () => goToPoolInfo(pool.coinInfoX, pool.coinInfoY),
        children: "View Pool"
      })]
    });
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col items-center gap-4 w-full",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex w-full justify-between max-w-[1280px] my-8",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-4xl mb-2",
          children: "Pools"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-primary-200",
          children: "Earn AUX and a share of the trading fees by providing liquidity to pools!"
        })]
      }), /* @__PURE__ */ jsx(qe, {
        size: "sm",
        onClick: () => goToAddLiquidity(),
        className: "self-center",
        children: "Create Pool"
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "flex flex-col gap-4 max-w-[1280px] w-full pb-12",
      children: (_a = pools == null ? void 0 : pools.map(renderLiquidityItem)) != null ? _a : NO_POOLS_UI
    })]
  });
}
function PoolsContainer({}) {
  var _a, _b, _c;
  const navigate = useNavigate();
  const {
    onFirstCoinSelect,
    onSecondCoinSelect
  } = useCoinXYParamState();
  const poolsQuery = useQuery(AllPoolsDocument);
  return /* @__PURE__ */ jsx(PoolsView, {
    pools: (_c = (_b = (_a = poolsQuery.data) == null ? void 0 : _a.pools) == null ? void 0 : _b.filter(Boolean)) != null ? _c : null,
    goToAddLiquidity: (coinx, coiny) => {
      if (coinx && coiny) {
        onFirstCoinSelect(coinx);
        onSecondCoinSelect(coiny);
        navigate(`/add-liquidity`);
      } else
        navigate("/add-liquidity");
    },
    goToRemoveLiquidity: (coinx, coiny) => {
      if (coinx && coiny) {
        onFirstCoinSelect(coinx);
        onSecondCoinSelect(coiny);
        navigate(`/remove-liquidity`);
      } else
        navigate("/remove-liquidity");
    },
    goToPoolInfo: (coinx, coiny) => {
      onFirstCoinSelect(coinx);
      onSecondCoinSelect(coiny);
      navigate(`/pool`);
    }
  });
}
const Nav$1 = "";
function Nav({}) {
  const navLinkClasses = "w-auto px-8 py-4 text-primary-300 align-middle border-b-4 border-transparent border-solid hover:border-primary-600 hover:text-primary-300 hover:bg-primary-800";
  const activeLinkClasses = " border-accent-500 border-brand text-white";
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-row w-auto mx-auto max-w-[100vw] overflow-x-auto md:translate-x-10",
    children: [/* @__PURE__ */ jsx(NavLink, {
      end: true,
      to: "/",
      className: (navData) => navLinkClasses + (navData.isActive ? activeLinkClasses : ""),
      children: "Swap"
    }), /* @__PURE__ */ jsx(NavLink, {
      end: true,
      to: "/pools",
      className: (navData) => navLinkClasses + (navData.isActive ? activeLinkClasses : ""),
      children: "Pools"
    }), /* @__PURE__ */ jsx(NavLink, {
      end: true,
      to: "/trade",
      className: (navData) => navLinkClasses + (navData.isActive ? activeLinkClasses : ""),
      children: "Trade"
    }), /* @__PURE__ */ jsx(NavLink, {
      end: true,
      to: "/portfolio",
      className: (navData) => navLinkClasses + (navData.isActive ? activeLinkClasses : ""),
      children: "Portfolio"
    })]
  });
}
const Header$1 = "";
function Header({}) {
  const connectWallet = () => {
  };
  const connectEl = /* @__PURE__ */ jsx(qe, {
    className: "my-auto mx-3",
    size: "sm",
    onClick: connectWallet,
    children: "Connect Wallet"
  });
  return /* @__PURE__ */ jsxs("header", {
    className: "grow-0 shrink-0 basis-auto items-center w-full flex flex-row top-0 bg-primary-900 border-b border-b-primary-700 box-shadow-lg z-20",
    children: [/* @__PURE__ */ jsx(Link, {
      to: "/",
      className: "p-3",
      children: /* @__PURE__ */ jsx("img", {
        src: "./logo.svg",
        alt: "AUX DEX Logo",
        className: "h-[32px] w-auto"
      })
    }), /* @__PURE__ */ jsx(Nav, {}), /* @__PURE__ */ jsx(ConnectWalletContainer, {
      trigger: connectEl
    }), /* @__PURE__ */ jsx(NetworkToggle, {})]
  });
}
const SwapForm = "";
function SwapPanel({
  coin,
  onCoinSelect,
  setValue,
  value,
  disabled,
  coins,
  title
}) {
  const onChange = react.exports.useCallback((e2) => setValue(Number(e2.currentTarget.value)), [setValue]);
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-xl p-6 flex bg-primary-800 shadow-md justify-between text-white font-bold",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex justify-between flex-auto flex-col gap-2",
      children: [/* @__PURE__ */ jsx(ie, {
        className: "text-primary-300",
        children: title
      }), /* @__PURE__ */ jsx("div", {
        children: /* @__PURE__ */ jsx(CoinSearchModalContainer, {
          coins,
          trigger: /* @__PURE__ */ jsx(CoinSelectButton, {
            coin
          }),
          onCoinSelect
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex justify-between flex-auto flex-col gap-4",
      children: [/* @__PURE__ */ jsx("div", {
        className: "text-sm text-right",
        children: "Balance: -"
      }), /* @__PURE__ */ jsx("input", {
        disabled: !!disabled,
        inputMode: "decimal",
        min: "0",
        type: "text",
        onChange,
        value: Number(value.toFixed(coin == null ? void 0 : coin.decimals)),
        className: "bg-transparent focus:outline-none h-[44px] text-2xl md:text-4xl placeholder:text-bds-dark-secondarys-DB500 text-white font-azeret w-full md:text-right",
        placeholder: "0.00"
      })]
    })]
  });
}
function SwapButton({
  onClick
}) {
  return /* @__PURE__ */ jsx("div", {
    className: "text-center h-4 flex justify-center",
    children: /* @__PURE__ */ jsx("div", {
      className: "absolute mt-[-1rem] w-12 text-brand bg-primary-900 shadow-md rounded-[50%] p-3 cursor-pointer hover:bg-primary-900/60",
      onClick,
      role: "button",
      children: /* @__PURE__ */ jsx(ArrowsUpDownIcon, {})
    })
  });
}
function SwapFormView({
  handleSwap,
  conversion,
  invertSelections,
  value,
  onSelectPrimary,
  onSelectSecondary,
  coins,
  primaryCoin,
  secondaryCoin,
  setValue
}) {
  return /* @__PURE__ */ jsxs(Dn, {
    className: "w-[700px] mx-auto self-center justify-self-center",
    children: [/* @__PURE__ */ jsx(_n, {
      className: "mb-4",
      children: "Swap"
    }), /* @__PURE__ */ jsx(SwapPanel, {
      title: "From",
      coins,
      coin: primaryCoin,
      onCoinSelect: onSelectPrimary,
      setValue,
      value
    }), /* @__PURE__ */ jsx(SwapButton, {
      onClick: invertSelections
    }), /* @__PURE__ */ jsx(SwapPanel, {
      title: "To",
      coins,
      coin: secondaryCoin,
      onCoinSelect: onSelectSecondary,
      value: conversion,
      setValue: () => {
      }
    }), /* @__PURE__ */ jsx(qe, {
      className: "mt-6",
      onClick: handleSwap,
      children: "Swap"
    })]
  });
}
function SwapFormContainer({}) {
  var _a, _b, _c;
  const {
    firstCoin,
    secondCoin,
    onFirstCoinSelect,
    onSecondCoinSelect,
    coins
  } = useCoinXYParamState();
  const notifications = Lt();
  const [value, setValue] = react.exports.useState(1);
  const firstCoinPrice = usePoolPriceIn({
    amount: value,
    coinTypeIn: firstCoin == null ? void 0 : firstCoin.coinType,
    poolInput: {
      coinTypeX: firstCoin == null ? void 0 : firstCoin.coinType,
      coinTypeY: secondCoin == null ? void 0 : secondCoin.coinType
    }
  });
  const conversion = (_c = (_b = (_a = firstCoinPrice.data) == null ? void 0 : _a.pool) == null ? void 0 : _b.priceIn) != null ? _c : 0;
  const invertSelections = () => {
    const pc = firstCoin;
    const sc = secondCoin;
    onFirstCoinSelect(sc);
    onSecondCoinSelect(pc);
    setValue(1);
  };
  const [wallet] = useWallet();
  const [swapMutation, swapResult] = useMutation(SwapDocument);
  const handleSwap = react.exports.useCallback(async () => {
    var _a2;
    const swapTx = await swapMutation({
      variables: {
        swapInput: {
          amountIn: value,
          coinTypeIn: firstCoin == null ? void 0 : firstCoin.coinType,
          coinTypeOut: secondCoin == null ? void 0 : secondCoin.coinType,
          minAmountOut: conversion,
          poolInput: {
            coinTypeX: firstCoin == null ? void 0 : firstCoin.coinType,
            coinTypeY: secondCoin == null ? void 0 : secondCoin.coinType
          }
        }
      }
    });
    await (wallet == null ? void 0 : wallet.signAndSubmitTransaction((_a2 = swapTx.data) == null ? void 0 : _a2.swap).then(() => notifications.addNotification({
      title: "Succes",
      type: "success",
      message: "Swap successful"
    })).catch((err) => {
      notifications.addNotification({
        title: "Error",
        type: "error",
        message: "Swap unsuccessful"
      });
    }));
  }, [firstCoin, secondCoin, value, conversion, wallet, swapMutation]);
  const onSelectPrimary = (c) => {
    onFirstCoinSelect(c);
    setValue(1);
  };
  const onSelectSecondary = (c) => {
    onSecondCoinSelect(c);
    setValue(1);
  };
  return /* @__PURE__ */ jsx(SwapFormView, {
    coins,
    conversion,
    handleSwap,
    invertSelections,
    onSelectPrimary,
    onSelectSecondary,
    primaryCoin: firstCoin,
    secondaryCoin: secondCoin,
    setValue,
    value
  });
}
const httpLink = new HttpLink({
  uri: window.rest_graphql_endpoint
});
const wsLink = new GraphQLWsLink(createClient({
  url: window.ws_graphql_endpoint
}));
const splitLink = split(({
  query
}) => {
  const definition = getMainDefinition(query);
  return definition.kind === "OperationDefinition" && definition.operation === "subscription";
}, wsLink, httpLink);
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  credentials: "include"
});
const BLACK_LIST = ["IR", "KP", "BY", "MM", "CI", "CU", "CD", "IQ", "LR", "SY", "ZW", "UA", "BI", "CF", "LY", "ML", "NI", "VE", "YE", "RU"];
function App() {
  const location = useGeoLocation();
  const country = location.country;
  return /* @__PURE__ */ jsx("div", {
    className: "dark w-full h-full",
    children: /* @__PURE__ */ jsx(ApolloProvider, {
      client,
      children: /* @__PURE__ */ jsx(WalletProvider, {
        children: /* @__PURE__ */ jsx(BrowserRouter, {
          children: /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col h-full w-full",
            children: [/* @__PURE__ */ jsx(Nn, {}), /* @__PURE__ */ jsx(Header, {}), BLACK_LIST.includes(country) ? /* @__PURE__ */ jsxs("div", {
              className: "flex flex-auto p-relative overflow-auto z-10 bg-gradient-to-br from-brand-gradient-start via-brand-gradient-mid to-brand-gradient-end max-w-[100vw] items-center justify-center text-white",
              children: ["Sorry we do not support ", country, " at this time."]
            }) : /* @__PURE__ */ jsx("div", {
              className: "flex flex-auto p-relative overflow-auto z-10 bg-gradient-to-br from-brand-gradient-start via-brand-gradient-mid to-brand-gradient-end max-w-[100vw]",
              children: /* @__PURE__ */ jsx(CoinXYParamCtxProvider, {
                children: /* @__PURE__ */ jsxs(Routes, {
                  children: [/* @__PURE__ */ jsx(Route, {
                    path: "/",
                    element: /* @__PURE__ */ jsx(SwapFormContainer, {})
                  }), /* @__PURE__ */ jsx(Route, {
                    path: "/add-liquidity",
                    element: /* @__PURE__ */ jsx(AddLiquidityContainer, {})
                  }), /* @__PURE__ */ jsx(Route, {
                    path: "/remove-liquidity",
                    element: /* @__PURE__ */ jsx(RemoveLiquidityContainer, {})
                  }), /* @__PURE__ */ jsx(Route, {
                    path: "/pools",
                    element: /* @__PURE__ */ jsx(PoolsContainer, {})
                  }), /* @__PURE__ */ jsx(Route, {
                    path: "/pool",
                    element: /* @__PURE__ */ jsx(PoolContainer, {})
                  }), /* @__PURE__ */ jsx(Route, {
                    path: "/trade",
                    element: /* @__PURE__ */ jsx(TradeContainer, {})
                  }), /* @__PURE__ */ jsx(Route, {
                    path: "/portfolio",
                    element: /* @__PURE__ */ jsx(PortfolioContainer, {})
                  })]
                })
              })
            })]
          })
        })
      })
    })
  });
}
const index = "";
client$1.createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsx(React.StrictMode, {
  children: /* @__PURE__ */ jsx(App, {})
}));
