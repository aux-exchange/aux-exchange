var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { c as create$1, r as react, W as We$1, g as gt, R as React, p as pt, m as mt, q as qe, O as Oe, u as useAnimationControls, a as motion, b as useNavigate, d as useLocation, e as be, G as Ge$1, S as Slider, f as useReactTable, h as flexRender, i as getCoreRowModel, j as getSortedRowModel, k as jsx, F as Fragment, l as jsxs, n as useSubscription, o as useQuery, C as ChevronUpIcon, s as ChevronDownIcon, M as MagnifyingGlassIcon, t as useParams, D as DateTime, v as randRecentDate, w as Do, x as useMutation, A as ArrowDownIcon, L as Link, y as ArrowLongLeftIcon, z as Square2StackIcon, E as EllipsisVerticalIcon, X as XMarkIcon, B as linear, H as colors_1, I as XMarkIcon$1, N as NavLink, J as ArrowsUpDownIcon, K as HttpLink, P as GraphQLWsLink, Q as createClient, T as split, U as getMainDefinition, V as ApolloClient, Y as InMemoryCache, Z as ApolloProvider, _ as BrowserRouter, $ as Routes, a0 as Route, a1 as client$1 } from "./vendor.1e2b8011.js";
import "./__commonjsHelpers__.4516dc8a.js";
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
function D(e2, n2) {
  if (Object.is(e2, n2))
    return true;
  if (typeof e2 != "object" || e2 === null || typeof n2 != "object" || n2 === null)
    return false;
  const o2 = Object.keys(e2);
  if (o2.length !== Object.keys(n2).length)
    return false;
  for (let r = 0; r < o2.length; r++)
    if (!Object.prototype.hasOwnProperty.call(n2, o2[r]) || !Object.is(e2[o2[r]], n2[o2[r]]))
      return false;
  return true;
}
let G;
const Kt = new Uint8Array(16);
function Xt() {
  if (!G && (G = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !G))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return G(Kt);
}
const _ = [];
for (let e2 = 0; e2 < 256; ++e2)
  _.push((e2 + 256).toString(16).slice(1));
function Jt(e2, n2 = 0) {
  return (_[e2[n2 + 0]] + _[e2[n2 + 1]] + _[e2[n2 + 2]] + _[e2[n2 + 3]] + "-" + _[e2[n2 + 4]] + _[e2[n2 + 5]] + "-" + _[e2[n2 + 6]] + _[e2[n2 + 7]] + "-" + _[e2[n2 + 8]] + _[e2[n2 + 9]] + "-" + _[e2[n2 + 10]] + _[e2[n2 + 11]] + _[e2[n2 + 12]] + _[e2[n2 + 13]] + _[e2[n2 + 14]] + _[e2[n2 + 15]]).toLowerCase();
}
const Zt = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), We = {
  randomUUID: Zt
};
function qt(e2, n2, o2) {
  if (We.randomUUID && !n2 && !e2)
    return We.randomUUID();
  e2 = e2 || {};
  const r = e2.random || (e2.rng || Xt)();
  if (r[6] = r[6] & 15 | 64, r[8] = r[8] & 63 | 128, n2) {
    o2 = o2 || 0;
    for (let s2 = 0; s2 < 16; ++s2)
      n2[o2 + s2] = r[s2];
    return n2;
  }
  return Jt(r);
}
var N = /* @__PURE__ */ ((e2) => (e2.basic = "basic", e2.error = "error", e2.warning = "warning", e2.info = "info", e2.success = "success", e2))(N || {});
const ge = create$1((e2) => ({
  notifications: [],
  addNotification(n2) {
    return e2((o2) => ({
      ...o2,
      notifications: o2.notifications.concat({
        ...n2,
        id: qt()
      })
    }));
  },
  removeNotification(n2) {
    return e2((o2) => ({
      ...o2,
      notifications: o2.notifications.filter((r) => n2 !== r)
    }));
  }
}));
function Gt() {
  const e2 = ge((r) => r.notifications, D), n2 = ge((r) => r.addNotification, D);
  return {
    removeNotification: ge((r) => r.removeNotification, D),
    addNotification: n2,
    notifications: e2
  };
}
const Q = create$1((e2) => ({
  params: new URLSearchParams(window.location.search),
  setParams: (n2) => e2((o2) => ({
    params: new URLSearchParams(n2)
  })),
  addParams: (...n2) => e2((o2) => {
    const r = o2.params;
    return n2.forEach(({
      key: s2,
      value: l
    }) => {
      if (!r.has(s2))
        r.append(s2, l);
      else {
        const f = `${r.get(s2)},${l}`;
        r.set(s2, f);
      }
    }), {
      params: new URLSearchParams(r)
    };
  }),
  removeParams: (...n2) => e2((o2) => {
    const r = o2.params;
    return n2.forEach(({
      key: s2,
      value: l
    }) => {
      if (r.has(s2)) {
        const c = r.get(s2);
        if (c) {
          const f = c.split(",").filter((d) => d !== l);
          f.length ? r.set(s2, f.join(",")) : r.delete(s2);
        }
      }
    }), {
      params: new URLSearchParams(r)
    };
  })
}));
function gn() {
  const e2 = useNavigate(), n2 = useLocation(), o2 = Q((c) => c.params, D), r = Q((c) => c.setParams, D), s2 = Q((c) => c.addParams, D), l = Q((c) => c.removeParams, D);
  return react.exports.useEffect(() => {
    const c = `${n2.pathname}?${new URLSearchParams(n2.search).toString()}`;
    `${n2.pathname}?${o2.toString()}` !== c && e2(`${n2.pathname}?${o2.toString()}`);
  }, [o2.toString(), n2]), {
    params: o2,
    setParams: r,
    addParams: s2,
    removeParams: l
  };
}
function Ge(e2) {
  var n2, o2, r = "";
  if (typeof e2 == "string" || typeof e2 == "number")
    r += e2;
  else if (typeof e2 == "object")
    if (Array.isArray(e2))
      for (n2 = 0; n2 < e2.length; n2++)
        e2[n2] && (o2 = Ge(e2[n2])) && (r && (r += " "), r += o2);
    else
      for (n2 in e2)
        e2[n2] && (r && (r += " "), r += n2);
  return r;
}
function Qt() {
  for (var e2, n2, o2 = 0, r = ""; o2 < arguments.length; )
    (e2 = arguments[o2++]) && (n2 = Ge(e2)) && (r && (r += " "), r += n2);
  return r;
}
const er = (e2) => typeof e2 == "boolean", tr = (e2) => er(e2) ? String(e2) : e2, rr = (e2, n2) => Object.entries(e2).every(([o2, r]) => n2[o2] === r);
function nr(e2) {
  return (n2, o2) => {
    const r = Object.entries(n2).reduce((f, [d, h]) => h === void 0 ? f : {
      ...f,
      [d]: h
    }, {}), s2 = {
      ...e2.defaultVariants,
      ...r
    }, l = Object.keys(e2.variants).map((f) => e2.variants[f][tr(n2[f]) || e2.defaultVariants[f]]), c = e2.compoundVariants.reduce((f, {
      classes: d,
      ...h
    }) => (rr(h, s2) && d && f.push(d), f), []);
    return Qt([e2.base, l, c, o2]);
  };
}
const or = nr({
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
var oe = { exports: {} }, U = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ye;
function sr() {
  if (Ye)
    return U;
  Ye = 1;
  var e2 = React, n2 = Symbol.for("react.element"), o2 = Symbol.for("react.fragment"), r = Object.prototype.hasOwnProperty, s2 = e2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, l = { key: true, ref: true, __self: true, __source: true };
  function c(f, d, h) {
    var p, b = {}, g = null, C = null;
    h !== void 0 && (g = "" + h), d.key !== void 0 && (g = "" + d.key), d.ref !== void 0 && (C = d.ref);
    for (p in d)
      r.call(d, p) && !l.hasOwnProperty(p) && (b[p] = d[p]);
    if (f && f.defaultProps)
      for (p in d = f.defaultProps, d)
        b[p] === void 0 && (b[p] = d[p]);
    return { $$typeof: n2, type: f, key: g, ref: C, props: b, _owner: s2.current };
  }
  return U.Fragment = o2, U.jsx = c, U.jsxs = c, U;
}
(function(e2) {
  e2.exports = sr();
})(oe);
const Qe = oe.exports.Fragment, a = oe.exports.jsx, w = oe.exports.jsxs;
function Ke({
  className: e2,
  children: n2,
  variant: o2,
  size: r,
  element: s2,
  onClick: l
}) {
  const c = or({
    size: r,
    variant: o2
  }, e2), d = (() => {
    switch (s2) {
      case "disclosure":
        return Oe.Button;
      case "menu":
        return qe.Button;
      case "popover":
        return mt.Button;
      case "listbox":
        return pt.Button;
      default:
        return "div";
    }
  })();
  return /* @__PURE__ */ a(d, {
    onClick: l,
    className: c,
    children: n2
  });
}
function ir({
  title: e2,
  titleId: n2,
  ...o2
}, r) {
  return /* @__PURE__ */ w("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, o2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
    })]
  });
}
const lr = react.exports.forwardRef(ir), cr = lr;
function ur({
  title: e2,
  titleId: n2,
  ...o2
}, r) {
  return /* @__PURE__ */ w("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, o2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
    })]
  });
}
const dr = react.exports.forwardRef(ur), fr = dr;
function hr({
  title: e2,
  titleId: n2,
  ...o2
}, r) {
  return /* @__PURE__ */ w("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, o2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    })]
  });
}
const mr = react.exports.forwardRef(hr), pr = mr;
function gr({
  title: e2,
  titleId: n2,
  ...o2
}, r) {
  return /* @__PURE__ */ w("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, o2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M19.5 8.25l-7.5 7.5-7.5-7.5"
    })]
  });
}
const vr = react.exports.forwardRef(gr), br = vr;
function wr({
  title: e2,
  titleId: n2,
  ...o2
}, r) {
  return /* @__PURE__ */ w("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, o2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M4.5 15.75l7.5-7.5 7.5 7.5"
    })]
  });
}
const yr = react.exports.forwardRef(wr), Cr = yr;
function xr({
  title: e2,
  titleId: n2,
  ...o2
}, r) {
  return /* @__PURE__ */ w("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, o2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
    })]
  });
}
const Er = react.exports.forwardRef(xr), Rr = Er;
function Sr({
  title: e2,
  titleId: n2,
  ...o2
}, r) {
  return /* @__PURE__ */ w("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, o2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
    })]
  });
}
const Or = react.exports.forwardRef(Sr), _r = Or;
function kr({
  title: e2,
  titleId: n2,
  ...o2
}, r) {
  return /* @__PURE__ */ w("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, o2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M6 18L18 6M6 6l12 12"
    })]
  });
}
const Tr = react.exports.forwardRef(kr), Mr = Tr;
function vn() {
  var b;
  const {
    removeNotification: e2,
    notifications: n2
  } = Gt(), o2 = react.exports.useRef(n2[0]), r = useAnimationControls(), [s2, l] = react.exports.useState(n2[0]), c = "flex items-start absolute bottom-8 right-8 bg-primary-800 w-[400px] h-auto p-4 text-cyan-700 z-50 opacity-0 border-l-4", f = {
    [N.basic]: " border-l-secondary-400",
    [N.error]: " border-l-red-400",
    [N.success]: " border-l-green-400",
    [N.info]: " border-l-secondary-400",
    [N.warning]: " "
  }, d = {
    duration: 0.3,
    ease: "easeInOut"
  }, h = react.exports.useRef(false);
  react.exports.useEffect(() => (h.current = true, () => {
    h.current = false;
  }), []), react.exports.useEffect(() => {
    s2 && r.start({
      opacity: 1,
      x: [200, 0],
      transition: d
    });
  }, [s2]), react.exports.useEffect(() => {
    var g;
    if (n2.length && JSON.stringify(o2.current) !== JSON.stringify(n2[0])) {
      const C = n2[0];
      l(C), o2.current = C;
      const R = setTimeout(async () => {
        await r.start({
          opacity: [1, 0],
          x: [0, 200],
          transition: d
        }), e2(C), l(void 0);
      }, (g = C.dismissAfter) != null ? g : 3e3);
      return () => {
        r.stop(), h.current || clearTimeout(R);
      };
    }
  }, [n2, e2, r]);
  const p = react.exports.useCallback(async (g) => {
    g.preventDefault(), s2 && (e2(s2), await r.start({
      opacity: [1, 0],
      x: [0, 200],
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }), l(void 0));
  }, [r, e2, s2]);
  return /* @__PURE__ */ w(motion.div, {
    className: c + ((s2 == null ? void 0 : s2.type) != null ? f[s2 == null ? void 0 : s2.type] : null),
    animate: r,
    children: [(s2 == null ? void 0 : s2.type) === N.error ? /* @__PURE__ */ a(Rr, {
      className: "w-10 h-10 text-red-400"
    }) : (s2 == null ? void 0 : s2.type) === N.success ? /* @__PURE__ */ a(pr, {
      className: "w-10 h-10 text-green-400"
    }) : (s2 == null ? void 0 : s2.type) === N.info ? /* @__PURE__ */ a(_r, {
      className: "w-10 h-10 text-secondary-400"
    }) : null, /* @__PURE__ */ w("div", {
      className: "flex flex-col ml-3 w-full",
      children: [/* @__PURE__ */ w("div", {
        className: "flex items-center justify-between text-lg font-semibold",
        children: [/* @__PURE__ */ a("div", {
          className: "mr-auto",
          children: s2 == null ? void 0 : s2.title
        }), /* @__PURE__ */ a(Ke, {
          size: "xs",
          variant: "basic",
          className: "border-0 bg-none",
          onClick: p,
          children: /* @__PURE__ */ a(Mr, {
            className: "w-4 h-4"
          })
        })]
      }), /* @__PURE__ */ a("div", {
        className: "text-white",
        children: s2 == null ? void 0 : s2.message
      }), /* @__PURE__ */ a("div", {
        children: (b = s2 == null ? void 0 : s2.actions) == null ? void 0 : b.map((g, C) => /* @__PURE__ */ a(Ke, {
          ...g
        }, C))
      })]
    })]
  });
}
function bn({
  children: e2,
  className: n2,
  id: o2
}) {
  const r = `font-semibold text-lg text-white ${n2}`;
  return /* @__PURE__ */ a("div", {
    id: o2,
    className: r,
    children: e2
  });
}
function se({
  children: e2,
  className: n2,
  htmlFor: o2
}) {
  const r = `font-bold text-xs text-primary-400 uppercase mb-1 ${n2}`, l = (() => o2 ? "label" : "div")();
  return /* @__PURE__ */ a(l, {
    htmlFor: o2,
    className: r,
    children: e2
  });
}
const Pr = ({
  size: e2
}) => /* @__PURE__ */ w("svg", {
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
}), $r = ({
  size: e2
}) => /* @__PURE__ */ a("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  height: e2,
  width: e2,
  children: /* @__PURE__ */ w("g", {
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
}), Fr = ({
  size: e2
}) => /* @__PURE__ */ a("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  width: e2,
  height: e2,
  children: /* @__PURE__ */ w("g", {
    fill: "none",
    fillRule: "evenodd",
    children: [/* @__PURE__ */ a("circle", {
      cx: "16",
      cy: "16",
      r: "16",
      fill: "#627EEA"
    }), /* @__PURE__ */ w("g", {
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
}), jr = ({
  size: e2
}) => /* @__PURE__ */ a("svg", {
  width: e2,
  height: e2,
  viewBox: "0 0 32 32",
  xmlns: "http://www.w3.org/2000/svg",
  children: /* @__PURE__ */ w("g", {
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
}), Ir = ({
  size: e2
}) => /* @__PURE__ */ a("svg", {
  width: e2,
  height: e2,
  viewBox: "0 0 32 32",
  xmlns: "http://www.w3.org/2000/svg",
  children: /* @__PURE__ */ w("g", {
    fill: "none",
    children: [/* @__PURE__ */ a("circle", {
      fill: "#3E73C4",
      cx: "16",
      cy: "16",
      r: "16"
    }), /* @__PURE__ */ w("g", {
      fill: "#FFF",
      children: [/* @__PURE__ */ a("path", {
        d: "M20.022 18.124c0-2.124-1.28-2.852-3.84-3.156-1.828-.243-2.193-.728-2.193-1.578 0-.85.61-1.396 1.828-1.396 1.097 0 1.707.364 2.011 1.275a.458.458 0 00.427.303h.975a.416.416 0 00.427-.425v-.06a3.04 3.04 0 00-2.743-2.489V9.142c0-.243-.183-.425-.487-.486h-.915c-.243 0-.426.182-.487.486v1.396c-1.829.242-2.986 1.456-2.986 2.974 0 2.002 1.218 2.791 3.778 3.095 1.707.303 2.255.668 2.255 1.639 0 .97-.853 1.638-2.011 1.638-1.585 0-2.133-.667-2.316-1.578-.06-.242-.244-.364-.427-.364h-1.036a.416.416 0 00-.426.425v.06c.243 1.518 1.219 2.61 3.23 2.914v1.457c0 .242.183.425.487.485h.915c.243 0 .426-.182.487-.485V21.34c1.829-.303 3.047-1.578 3.047-3.217z"
      }), /* @__PURE__ */ a("path", {
        d: "M12.892 24.497c-4.754-1.7-7.192-6.98-5.424-11.653.914-2.55 2.925-4.491 5.424-5.402.244-.121.365-.303.365-.607v-.85c0-.242-.121-.424-.365-.485-.061 0-.183 0-.244.06a10.895 10.895 0 00-7.13 13.717c1.096 3.4 3.717 6.01 7.13 7.102.244.121.488 0 .548-.243.061-.06.061-.122.061-.243v-.85c0-.182-.182-.424-.365-.546zm6.46-18.936c-.244-.122-.488 0-.548.242-.061.061-.061.122-.061.243v.85c0 .243.182.485.365.607 4.754 1.7 7.192 6.98 5.424 11.653-.914 2.55-2.925 4.491-5.424 5.402-.244.121-.365.303-.365.607v.85c0 .242.121.424.365.485.061 0 .183 0 .244-.06a10.895 10.895 0 007.13-13.717c-1.096-3.46-3.778-6.07-7.13-7.162z"
      })]
    })]
  })
}), Nr = ({
  size: e2
}) => /* @__PURE__ */ a("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  width: e2,
  height: e2,
  children: /* @__PURE__ */ w("g", {
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
}), Lr = ({
  size: e2
}) => /* @__PURE__ */ w("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  height: e2,
  width: e2,
  children: [/* @__PURE__ */ a("circle", {
    cx: "16",
    cy: "16",
    r: "16",
    fill: "#0f172a",
    fillRule: "evenodd"
  }), /* @__PURE__ */ w("g", {
    fillRule: "nonzero",
    children: [/* @__PURE__ */ a("path", {
      d: "M20,18c.0002652,.0002652,.0000481,.0001922,.000139,.0005561l1.8785932,7.5143726c.0666973,.2667892,.3462678,.4850713,.6212678,.4850713h5c.275,0,.4454295-.2182821,.3787322-.4850713L23.1212678,6.4850713c-.0666973-.2667892-.3462678-.4850713-.6212678-.4850713H9.5c-.275,0-.5545705,.2182821-.6212678,.4850713L4.1212678,25.5149287c-.0666973,.2667892,.1037322,.4850713,.3787322,.4850713h5c.275,0,.5545705-.2182821,.6212678-.4850713l1.8787322-7.5149287m-.5-4c-.275,0-.4454295-.2182821-.3787322-.4850713l.7574644-3.0298575c.0666973-.2667892,.3462678-.4850713,.6212678-.4850713h7c.275,0,.5545705,.2182821,.6212678,.4850713l.7574644,3.0298575c.0666973,.2667892-.1037322,.4850713-.3787322,.4850713H11.5Z",
      fill: "#00aeef"
    }), /* @__PURE__ */ a("path", {
      d: "M25.9393661,13.7574644c.0333486,.1333946-.0518661,.2425356-.1893661,.2425356h-.5c-.1375,0-.2772853-.109141-.3106339-.2425356l-.8787322-3.5149287c-.0333486-.1333946,.0518661-.2425356,.1893661-.2425356h.5c.1375,0,.2772853,.109141,.3106339,.2425356l.8787322,3.5149287Z",
      fill: "#007aa7"
    }), /* @__PURE__ */ a("path", {
      d: "M7.0606339,13.7574644c-.0333486,.1333946-.1731339,.2425356-.3106339,.2425356h-.5c-.1375,0-.2227147-.109141-.1893661-.2425356l.8787322-3.5149287c.0333486-.1333946,.1731339-.2425356,.3106339-.2425356h.5c.1375,0,.2227147,.109141,.1893661,.2425356l-.8787322,3.5149287Z",
      fill: "#007aa7"
    }), /* @__PURE__ */ a("rect", {
      x: "15.5",
      y: "3",
      width: "1",
      height: "3",
      fill: "#007aa7"
    }), /* @__PURE__ */ a("rect", {
      x: "14.0000005",
      y: "2",
      width: "3.9999953",
      height: "1.0000001",
      rx: ".4999994",
      ry: ".4999994",
      fill: "#00aeef"
    })]
  })]
}), Dr = ({
  size: e2
}) => /* @__PURE__ */ w("svg", {
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
function Vr({
  symbol: e2,
  size: n2
}) {
  switch (e2) {
    case "apt":
      return /* @__PURE__ */ a(Pr, {
        size: n2
      });
    case "btc":
      return /* @__PURE__ */ a($r, {
        size: n2
      });
    case "eth":
      return /* @__PURE__ */ a(Fr, {
        size: n2
      });
    case "sol":
      return /* @__PURE__ */ a(jr, {
        size: n2
      });
    case "usdt":
      return /* @__PURE__ */ a(Nr, {
        size: n2
      });
    case "usdc":
      return /* @__PURE__ */ a(Ir, {
        size: n2
      });
    case "aux":
      return /* @__PURE__ */ a(Lr, {
        size: n2
      });
    case "martian":
      return /* @__PURE__ */ a(Dr, {
        size: n2
      });
    default:
      return null;
  }
}
function zr({
  coin: e2,
  size: n2
}) {
  return e2 ? /* @__PURE__ */ a(Vr, {
    symbol: e2 == null ? void 0 : e2.toLowerCase(),
    size: n2 != null ? n2 : 32
  }) : null;
}
function wn({
  coins: e2,
  size: n2 = 32
}) {
  return /* @__PURE__ */ a("div", {
    className: "flex items-center -space-x-2",
    children: e2.map((o2, r) => /* @__PURE__ */ a("div", {
      className: "inline-block rounded-full drop-shadow-lg ring-2 ring-primary-200",
      children: /* @__PURE__ */ a(zr, {
        coin: o2,
        size: n2
      }, `avatar-${o2}-${r}`)
    }))
  });
}
function yn({
  children: e2,
  className: n2,
  variant: o2,
  size: r,
  onClick: s2
}) {
  const l = () => {
    switch (o2) {
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
    switch (r) {
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
    const h = "font-semibold rounded shadow-sm", p = c(), b = l();
    return `${h} ${p} ${b} ${n2 != null ? n2 : ""}`;
  })();
  return /* @__PURE__ */ a("span", {
    onClick: s2,
    className: d,
    children: e2
  });
}
function Ar({
  valueChange: e2,
  percentChange: n2,
  priceDirection: o2
}) {
  const s2 = (() => {
    const l = "inline-flex items-center font-bold text-xs";
    return o2 && o2 === "up" ? `${l} text-green-400` : o2 && o2 === "down" ? `${l} text-red-400` : `${l} text-primary-400`;
  })();
  return /* @__PURE__ */ w("div", {
    className: s2,
    children: [o2 && o2 === "up" ? /* @__PURE__ */ a(fr, {
      className: "w-[14px] h-[14px] mr-1"
    }) : o2 && o2 === "down" ? /* @__PURE__ */ a(cr, {
      className: "w-[14px] h-[14px] mr-1"
    }) : null, n2 && /* @__PURE__ */ w("div", {
      className: "mr-2",
      children: [n2, "%"]
    }), e2 && /* @__PURE__ */ a("div", {
      children: e2
    })]
  });
}
function Cn({
  title: e2,
  value: n2,
  valueChange: o2,
  percentChange: r,
  priceDirection: s2,
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
  }, p = (() => {
    const b = "p-3 rounded-lg", g = d();
    return `${b} ${g} ${c != null ? c : ""}`;
  })();
  return /* @__PURE__ */ w("div", {
    className: p,
    onClick: f,
    children: [/* @__PURE__ */ a(se, {
      children: e2
    }), /* @__PURE__ */ a("div", {
      className: "text-2xl",
      children: n2
    }), r || o2 ? /* @__PURE__ */ a(Ar, {
      percentChange: r,
      valueChange: o2,
      priceDirection: s2
    }) : null]
  });
}
function Br(...e2) {
  return e2.filter(Boolean).join(" ");
}
function xn({
  options: e2,
  onChange: n2,
  label: o2,
  value: r,
  className: s2
}) {
  const [l, c] = react.exports.useState(r), f = react.exports.useCallback((d) => {
    n2 == null || n2(d.value), c(d);
  }, [n2]);
  return /* @__PURE__ */ a(pt, {
    value: l,
    onChange: f,
    children: ({
      open: d
    }) => /* @__PURE__ */ a(Qe, {
      children: /* @__PURE__ */ w("div", {
        className: `relative mt-1 w-56 ${s2}`,
        children: [/* @__PURE__ */ a(se, {
          className: "block",
          children: o2
        }), /* @__PURE__ */ w(pt.Button, {
          className: " text-white relative w-full h-[46px] cursor-default rounded-md bg-primary-800 py-2 pl-3 pr-10 text-left truncate outline-none border border-transparent focus:border-brand focus-visible:border-brand hover:cursor-pointer sm:text-sm",
          children: [l.label, /* @__PURE__ */ a("span", {
            className: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3",
            children: d ? /* @__PURE__ */ a(Cr, {
              className: "h-4 w-4 text-primary-400",
              "aria-hidden": "true"
            }) : /* @__PURE__ */ a(br, {
              className: "h-4 w-4 text-primary-400",
              "aria-hidden": "true"
            })
          })]
        }), /* @__PURE__ */ a(pt.Options, {
          className: " absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-primary-700 py-1 text-white shadow-lg ring-1 border-none ring-black ring-opacity-5 outline-none sm:text-sm ",
          children: e2.map((h) => /* @__PURE__ */ a(pt.Option, {
            value: h,
            className: ({
              active: p
            }) => Br(p ? "text-white bg-secondary-600" : "text-white", "relative cursor-pointer select-none py-2 pl-3 pr-9"),
            children: h.label
          }, h.label))
        })]
      })
    })
  });
}
function En({
  value: e2,
  onChange: n2,
  name: o2,
  placeholder: r = "0.00",
  label: s2,
  prefix: l,
  suffix: c,
  className: f,
  inputClass: d,
  autoFocus: h = false
}) {
  const b = (() => `bg-primary-800 p-3 block w-full rounded-md outline-none border border-transparent focus:border-brand focus-visible:border-brand sm:text-sm ${l ? "pl-7" : ""} ${c ? "pr-12" : ""} ${d}`)();
  return /* @__PURE__ */ w("div", {
    className: f,
    children: [s2 && /* @__PURE__ */ a(se, {
      htmlFor: o2,
      children: s2
    }), /* @__PURE__ */ w("div", {
      className: "relative rounded-md shadow-sm ",
      children: [/* @__PURE__ */ a("div", {
        className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
        children: l
      }), /* @__PURE__ */ a("input", {
        autoFocus: h,
        type: "text",
        name: o2,
        id: o2,
        value: e2,
        placeholder: r,
        onChange: n2,
        className: b
      }), /* @__PURE__ */ a("div", {
        className: "absolute inset-y-0 right-3 flex items-center text-gray-300",
        children: c
      })]
    })]
  });
}
function Rn({
  enabled: e2,
  onChange: n2
}) {
  return /* @__PURE__ */ a(be, {
    checked: e2,
    onChange: n2,
    className: `${e2 ? "bg-green-600" : "bg-accent-900"}
        relative 
        inline-flex 
        h-[28px] 
        w-[54px] 
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
          ${e2 ? "tranprimary-x-[25px]" : "tranprimary-x-0"}
          pointer-events-none 
          inline-block 
          h-[24px] 
          w-[24px] 
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
function Sn({
  tabs: e2
}) {
  const n2 = (r) => r === "buy" ? "border-b-green-500 text-green-400" : r === "sell" ? "border-b-red-500 text-red-400" : "border-b-secondary-500 text-secondary-400", o2 = (r, s2) => {
    const l = "w-full py-2.5 text-sm font-semibold leading-5 border-b-2 border-primary-700 outline-none";
    if (r) {
      const c = n2(s2);
      return `${l} ${c}`;
    } else
      return `${l} text-primary-300 hover:bg-white/[0.05]`;
  };
  return /* @__PURE__ */ a(Ge$1.List, {
    className: "flex",
    children: e2.map((r) => /* @__PURE__ */ a(Ge$1, {
      className: ({
        selected: s2
      }) => o2(s2, r.variant),
      onClick: r.onClick,
      children: r.label
    }, r.label))
  });
}
function On({
  max: e2,
  min: n2,
  value: o2,
  onChange: r
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
      value: o2,
      max: e2,
      min: n2,
      onChange: r
    })
  });
}
const _n = ({
  children: e2,
  className: n2,
  id: o2,
  padding: r,
  onClick: s2
}) => /* @__PURE__ */ a("div", {
  onClick: s2,
  id: o2,
  className: `rounded-2xl bg-primary-900 p-${r != null ? r : 6} shadow-md ${n2 != null ? n2 : ""}`,
  children: e2
});
const kn = react.exports.forwardRef(function({
  children: n2,
  trigger: o2
}, r) {
  const [s2, l] = react.exports.useState(false), c = react.exports.useRef(null);
  return react.exports.useImperativeHandle(r, () => ({
    isOpen: s2,
    openModal() {
      l(true);
    },
    closeModal() {
      l(false);
    }
  }), [s2]), /* @__PURE__ */ w(Qe, {
    children: [o2 ? /* @__PURE__ */ a("div", {
      onClick: () => l(true),
      children: o2
    }) : null, /* @__PURE__ */ a(We$1.Root, {
      show: s2,
      as: react.exports.Fragment,
      children: /* @__PURE__ */ w(gt, {
        as: "div",
        className: "relative z-10",
        initialFocus: c,
        onClose: l,
        children: [/* @__PURE__ */ a(We$1.Child, {
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
            children: /* @__PURE__ */ a(We$1.Child, {
              as: react.exports.Fragment,
              enter: "ease-out duration-300",
              enterFrom: "opacity-0 tranprimary-y-4 sm:tranprimary-y-0 sm:scale-95",
              enterTo: "opacity-100 tranprimary-y-0 sm:scale-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100 tranprimary-y-0 sm:scale-100",
              leaveTo: "opacity-0 tranprimary-y-4 sm:tranprimary-y-0 sm:scale-95",
              children: /* @__PURE__ */ a(gt.Panel, {
                className: "relative transform overflow-hidden bg-transparent text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg",
                children: n2
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
function ee(e2, n2, o2) {
  let r = [], s2;
  return () => {
    let l;
    o2.key && o2.debug != null && o2.debug() && (l = Date.now());
    const c = e2();
    if (!(c.length !== r.length || c.some((h, p) => r[p] !== h)))
      return s2;
    r = c;
    let d;
    if (o2.key && o2.debug != null && o2.debug() && (d = Date.now()), s2 = n2(...c), o2 == null || o2.onChange == null || o2.onChange(s2), o2.key && o2.debug != null && o2.debug()) {
      const h = Math.round((Date.now() - l) * 100) / 100, p = Math.round((Date.now() - d) * 100) / 100, b = p / 16, g = (C, R) => {
        for (C = String(C); C.length < R; )
          C = " " + C;
        return C;
      };
      console.info("%c\u23F1 " + g(p, 5) + " /" + g(h, 5) + " ms", `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(` + Math.max(0, Math.min(120 - 120 * b, 120)) + "deg 100% 31%);", o2 == null ? void 0 : o2.key);
    }
    return s2;
  };
}
const Ur = (e2) => e2, Wr = (e2) => {
  const n2 = Math.max(e2.startIndex - e2.overscan, 0), o2 = Math.min(e2.endIndex + e2.overscan, e2.count - 1), r = [];
  for (let s2 = n2; s2 <= o2; s2++)
    r.push(s2);
  return r;
}, Yr = (e2, n2) => {
  const o2 = new ResizeObserver((r) => {
    var s2, l;
    n2({
      width: (s2 = r[0]) == null ? void 0 : s2.contentRect.width,
      height: (l = r[0]) == null ? void 0 : l.contentRect.height
    });
  });
  if (!!e2.scrollElement)
    return n2(e2.scrollElement.getBoundingClientRect()), o2.observe(e2.scrollElement), () => {
      o2.unobserve(e2.scrollElement);
    };
}, Xe = {
  element: ["scrollLeft", "scrollTop"],
  window: ["scrollX", "scrollY"]
}, Hr = (e2) => (n2, o2) => {
  if (!n2.scrollElement)
    return;
  const r = Xe[e2][0], s2 = Xe[e2][1];
  let l = n2.scrollElement[r], c = n2.scrollElement[s2];
  const f = () => {
    o2(n2.scrollElement[n2.options.horizontal ? r : s2]);
  };
  f();
  const d = (h) => {
    const p = h.currentTarget, b = p[r], g = p[s2];
    (n2.options.horizontal ? l - b : c - g) && f(), l = b, c = g;
  };
  return n2.scrollElement.addEventListener("scroll", d, {
    capture: false,
    passive: true
  }), () => {
    n2.scrollElement.removeEventListener("scroll", d);
  };
}, Kr = Hr("element"), Xr = (e2, n2) => e2.getBoundingClientRect()[n2.options.horizontal ? "width" : "height"], Jr = (e2, n2, o2) => {
  var r;
  (r = o2.scrollElement) == null || r.scrollTo == null || r.scrollTo({
    [o2.options.horizontal ? "left" : "top"]: e2,
    behavior: n2 ? "smooth" : void 0
  });
};
class Zr {
  constructor(n2) {
    var o2 = this;
    this.unsubs = [], this.scrollElement = null, this.measurementsCache = [], this.itemMeasurementsCache = {}, this.pendingMeasuredCacheIndexes = [], this.measureElementCache = {}, this.range = {
      startIndex: 0,
      endIndex: 0
    }, this.setOptions = (r) => {
      Object.entries(r).forEach((s2) => {
        let [l, c] = s2;
        typeof c > "u" && delete r[l];
      }), this.options = {
        debug: false,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: false,
        getItemKey: Ur,
        rangeExtractor: Wr,
        enableSmoothScroll: true,
        onChange: () => {
        },
        measureElement: Xr,
        initialRect: {
          width: 0,
          height: 0
        },
        ...r
      };
    }, this.notify = () => {
      var r, s2;
      (r = (s2 = this.options).onChange) == null || r.call(s2, this);
    }, this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((r) => r()), this.unsubs = [], this.scrollElement = null;
    }, this._didMount = () => () => {
      this.cleanup();
    }, this._willUpdate = () => {
      const r = this.options.getScrollElement();
      this.scrollElement !== r && (this.cleanup(), this.scrollElement = r, this._scrollToOffset(this.scrollOffset, false), this.unsubs.push(this.options.observeElementRect(this, (s2) => {
        this.scrollRect = s2, this.calculateRange();
      })), this.unsubs.push(this.options.observeElementOffset(this, (s2) => {
        this.scrollOffset = s2, this.calculateRange();
      })));
    }, this.getSize = () => this.scrollRect[this.options.horizontal ? "width" : "height"], this.getMeasurements = ee(() => [this.options.count, this.options.paddingStart, this.options.getItemKey, this.itemMeasurementsCache], (r, s2, l, c) => {
      const f = this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
      this.pendingMeasuredCacheIndexes = [];
      const d = this.measurementsCache.slice(0, f);
      for (let h = f; h < r; h++) {
        const p = l(h), b = c[p], g = d[h - 1] ? d[h - 1].end : s2, C = typeof b == "number" ? b : this.options.estimateSize(h), R = g + C;
        d[h] = {
          index: h,
          start: g,
          size: C,
          end: R,
          key: p
        };
      }
      return this.measurementsCache = d, d;
    }, {
      key: false,
      debug: () => this.options.debug
    }), this.calculateRange = ee(() => [this.getMeasurements(), this.getSize(), this.scrollOffset], (r, s2, l) => {
      const c = Gr({
        measurements: r,
        outerSize: s2,
        scrollOffset: l
      });
      return (c.startIndex !== this.range.startIndex || c.endIndex !== this.range.endIndex) && (this.range = c, this.notify()), this.range;
    }, {
      key: false,
      debug: () => this.options.debug
    }), this.getIndexes = ee(() => [this.options.rangeExtractor, this.range, this.options.overscan, this.options.count], (r, s2, l, c) => r({
      ...s2,
      overscan: l,
      count: c
    }), {
      key: false,
      debug: () => this.options.debug
    }), this.getVirtualItems = ee(() => [this.getIndexes(), this.getMeasurements(), this.options.measureElement], (r, s2, l) => {
      const c = (p) => (b) => {
        var g;
        const C = this.measurementsCache[p];
        if (!b)
          return;
        const R = l(b, this), k = (g = this.itemMeasurementsCache[C.key]) != null ? g : C.size;
        R !== k && (C.start < this.scrollOffset && (this.destinationOffset || this._scrollToOffset(this.scrollOffset + (R - k), false)), this.pendingMeasuredCacheIndexes.push(p), this.itemMeasurementsCache = {
          ...this.itemMeasurementsCache,
          [C.key]: R
        }, this.notify());
      }, f = [], d = {};
      for (let p = 0, b = r.length; p < b; p++) {
        var h;
        const g = r[p], R = {
          ...s2[g],
          measureElement: d[g] = (h = this.measureElementCache[g]) != null ? h : c(g)
        };
        f.push(R);
      }
      return this.measureElementCache = d, f;
    }, {
      key: false,
      debug: () => this.options.debug
    }), this.scrollToOffset = function(r, s2) {
      let {
        align: l = "start",
        smoothScroll: c = o2.options.enableSmoothScroll
      } = s2 === void 0 ? {} : s2;
      const f = o2.scrollOffset, d = o2.getSize();
      l === "auto" && (r <= f ? l = "start" : r >= f + d ? l = "end" : l = "start"), l === "start" ? o2._scrollToOffset(r, c) : l === "end" ? o2._scrollToOffset(r - d, c) : l === "center" && o2._scrollToOffset(r - d / 2, c);
    }, this.scrollToIndex = function(r, s2) {
      let {
        align: l = "auto",
        smoothScroll: c = o2.options.enableSmoothScroll,
        ...f
      } = s2 === void 0 ? {} : s2;
      const d = o2.getMeasurements(), h = o2.scrollOffset, p = o2.getSize(), {
        count: b
      } = o2.options, g = d[Math.max(0, Math.min(r, b - 1))];
      if (!g)
        return;
      if (l === "auto")
        if (g.end >= h + p - o2.options.scrollPaddingEnd)
          l = "end";
        else if (g.start <= h + o2.options.scrollPaddingStart)
          l = "start";
        else
          return;
      const C = l === "end" ? g.end + o2.options.scrollPaddingEnd : g.start - o2.options.scrollPaddingStart;
      o2.scrollToOffset(C, {
        align: l,
        smoothScroll: c,
        ...f
      });
    }, this.getTotalSize = () => {
      var r;
      return (((r = this.getMeasurements()[this.options.count - 1]) == null ? void 0 : r.end) || this.options.paddingStart) + this.options.paddingEnd;
    }, this._scrollToOffset = (r, s2) => {
      clearTimeout(this.scrollCheckFrame), this.destinationOffset = r, this.options.scrollToFn(r, s2, this);
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
    }, this.setOptions(n2), this.scrollRect = this.options.initialRect, this.scrollOffset = this.options.initialOffset, this.calculateRange();
  }
}
const qr = (e2, n2, o2, r) => {
  for (; e2 <= n2; ) {
    const s2 = (e2 + n2) / 2 | 0, l = o2(s2);
    if (l < r)
      e2 = s2 + 1;
    else if (l > r)
      n2 = s2 - 1;
    else
      return s2;
  }
  return e2 > 0 ? e2 - 1 : 0;
};
function Gr(e2) {
  let {
    measurements: n2,
    outerSize: o2,
    scrollOffset: r
  } = e2;
  const s2 = n2.length - 1, c = qr(0, s2, (d) => n2[d].start, r);
  let f = c;
  for (; f < s2 && n2[f].end < r + o2; )
    f++;
  return {
    startIndex: c,
    endIndex: f
  };
}
const Qr = typeof window < "u" ? react.exports.useLayoutEffect : react.exports.useEffect;
function en(e2) {
  const n2 = react.exports.useReducer(() => ({}), {})[1], o2 = {
    ...e2,
    onChange: (s2) => {
      n2(), e2.onChange == null || e2.onChange(s2);
    }
  }, [r] = react.exports.useState(() => new Zr(o2));
  return r.setOptions(o2), react.exports.useEffect(() => r._didMount(), []), Qr(() => r._willUpdate()), r;
}
function tn(e2) {
  return en({
    observeElementRect: Yr,
    observeElementOffset: Kr,
    scrollToFn: Jr,
    ...e2
  });
}
function rn({
  title: e2,
  titleId: n2,
  ...o2
}, r) {
  return /* @__PURE__ */ w("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, o2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      fillRule: "evenodd",
      d: "M12 2.25a.75.75 0 01.75.75v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06l6.22 6.22V3a.75.75 0 01.75-.75z",
      clipRule: "evenodd"
    })]
  });
}
const nn = react.exports.forwardRef(rn), on = nn;
function sn({
  title: e2,
  titleId: n2,
  ...o2
}, r) {
  return /* @__PURE__ */ w("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, o2),
    children: [e2 ? /* @__PURE__ */ a("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ a("path", {
      fillRule: "evenodd",
      d: "M11.47 2.47a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06l-6.22-6.22V21a.75.75 0 01-1.5 0V4.81l-6.22 6.22a.75.75 0 11-1.06-1.06l7.5-7.5z",
      clipRule: "evenodd"
    })]
  });
}
const an = react.exports.forwardRef(sn), ln = an;
function Tn({
  data: e2,
  columns: n2,
  customRowRender: o2,
  virtualizeOptions: r,
  className: s2
}) {
  const [l, c] = react.exports.useState([]), f = useReactTable({
    columns: n2,
    data: e2,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: c,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: l
    }
  }), d = react.exports.useRef(null), {
    rows: h
  } = f.getRowModel(), p = tn(r != null ? r : {
    getScrollElement: () => d.current,
    count: h.length,
    estimateSize: () => h.length,
    overscan: 10
  }), {
    getVirtualItems: b,
    getTotalSize: g
  } = p, C = b();
  return g(), /* @__PURE__ */ w("table", {
    className: `border-collapse table-auto max-w-full w-full text-sm capitalize relative ${s2}`,
    ref: d,
    children: [/* @__PURE__ */ a("thead", {
      children: f.getHeaderGroups().map((R) => /* @__PURE__ */ a("tr", {
        children: R.headers.map((k) => /* @__PURE__ */ a("th", {
          onClick: k.column.getToggleSortingHandler(),
          className: "border-b dark:border-primary-600 font-medium p-2 pl-4 pt-0 pb-3 text-primary-400 dark:text-primary-200 text-left",
          children: /* @__PURE__ */ w(se, {
            children: [flexRender(k.column.columnDef.header, k.getContext()), k.column.getIsSorted() ? k.column.getIsSorted() === "desc" ? /* @__PURE__ */ a("span", {
              className: "w-3 h-3 ml-3 text-brand inline-block",
              children: /* @__PURE__ */ a(on, {})
            }) : /* @__PURE__ */ a("span", {
              className: "w-3 h-3 ml-3 text-brand inline-block",
              children: /* @__PURE__ */ a(ln, {})
            }) : null]
          })
        }, k.id))
      }, R.id))
    }), /* @__PURE__ */ a("tbody", {
      children: C.map((R) => {
        var H;
        const k = h[R.index];
        return (H = o2 == null ? void 0 : o2(k)) != null ? H : /* @__PURE__ */ a("tr", {
          children: k.getVisibleCells().map((F) => /* @__PURE__ */ a("td", {
            className: "border-b border-primary-100 dark:border-primary-700 p-2 pl-4 text-primary-500 dark:text-primary-200 text-left",
            children: flexRender(F.column.columnDef.cell, F.getContext())
          }, F.id))
        }, k.id);
      })
    })]
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
const martian = new MartianWalletAdapter();
const petra = new PetraWalletAdapter();
const WALLETS = [martian, petra];
const ConnectWalletView = react.exports.forwardRef(function ConnectWalletView2({
  trigger
}, _ref) {
  const backupRef = react.exports.useRef();
  const ref = _ref != null ? _ref : backupRef;
  const [options, setOptions] = react.exports.useState([]);
  const [activeWallet, setActiveWallet, connection] = useWallet();
  const suggestedBadge = /* @__PURE__ */ jsx(yn, {
    size: "xs",
    children: "Recommended"
  });
  const connectedBadge = /* @__PURE__ */ jsx(yn, {
    size: "xs",
    variant: "success",
    children: "Connected"
  });
  const detectedBadge = /* @__PURE__ */ jsx(yn, {
    size: "xs",
    variant: "basic",
    children: "Detected"
  });
  const walletOptions = WALLETS.map((w2) => ({
    name: w2.walletType,
    checkDetected: w2.isDetected,
    checkConnected: w2.isConnected,
    async onClick() {
      var _a;
      await (activeWallet == null ? void 0 : activeWallet.disconnect());
      setActiveWallet(w2);
      await w2.connect();
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
          return /* @__PURE__ */ jsxs(Ke, {
            variant: "regular",
            size: "sm",
            className: "mr-3",
            onClick: () => {
            },
            children: [walletType, " Wallet: ", addressResult]
          });
      }
    }
    return defaultTrigger;
  };
  return /* @__PURE__ */ jsx(Fragment, {
    children: /* @__PURE__ */ jsx(kn, {
      trigger: renderTrigger(trigger, activeWallet == null ? void 0 : activeWallet.walletType, connection == null ? void 0 : connection.address),
      ref,
      children: /* @__PURE__ */ jsxs(_n, {
        className: "h-[400px] bg-primary-800 border border-primary-700",
        children: [/* @__PURE__ */ jsx("div", {
          className: "pb-3 text-xl bg-stripes-secondary",
          children: "Select Wallet"
        }), options.map((wallet) => /* @__PURE__ */ jsx("div", {
          onClick: wallet.onClick,
          className: `rounded-lg p-4 hover:bg-secondary-800 hover:cursor-pointer ${wallet.suggested && "bg-brand-purple/60"}`,
          children: /* @__PURE__ */ jsxs("div", {
            className: "flex items-center",
            children: [/* @__PURE__ */ jsx(zr, {
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
              children: [!wallet.connected ? suggestedBadge : null, wallet.connected ? connectedBadge : null, !wallet.connected ? detectedBadge : null]
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
      children: [/* @__PURE__ */ jsx(wn, {
        coins: [market.baseCoinInfo.symbol, market.quoteCoinInfo.symbol],
        size: 32
      }), /* @__PURE__ */ jsxs("div", {
        className: "ml-3",
        children: [/* @__PURE__ */ jsx("div", {
          className: "text-xl font-medium text-white mb-1",
          children: market.name
        }), /* @__PURE__ */ jsx("div", {
          className: "text-xs font-bold text-primary-400 uppercase",
          children: "Vol: Unavailable"
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col items-center text-right",
      children: [/* @__PURE__ */ jsx("div", {
        className: "text-xl text-primary-200 mb-1",
        children: "42"
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
  } = gn();
  const coinsQuery = usePoolCoins();
  const coins = (_b = (_a = coinsQuery.data) == null ? void 0 : _a.poolCoins) != null ? _b : [];
  const defaultCoinX = (_c = coins.find(({
    coinType
  }) => coinType.toLowerCase().match("btc"))) == null ? void 0 : _c.coinType;
  const defaultCoinY = (_d = coins.find(({
    coinType
  }) => coinType.toLowerCase().match("usd"))) == null ? void 0 : _d.coinType;
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
          }]
        }
      }]
    }
  }]
};
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
  const marketsQuery = useQuery(MarketsDocument);
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
    children: /* @__PURE__ */ jsx(mt, {
      className: "relative",
      ref: popoverRef,
      children: ({
        open,
        close
      }) => {
        var _a2;
        return /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx(se, {
            children: "Select Market"
          }), /* @__PURE__ */ jsxs(mt.Button, {
            className: `${open ? "" : "hover:bg-primary-700"} ${baseButtonClasses}`,
            children: [/* @__PURE__ */ jsx(wn, {
              coins: [firstCoin == null ? void 0 : firstCoin.symbol, secondCoin == null ? void 0 : secondCoin.symbol],
              size: 32
            }), /* @__PURE__ */ jsx("div", {
              className: "text-xl ml-3 mr-auto text-left",
              children: (_a2 = selectedMarket == null ? void 0 : selectedMarket.name) != null ? _a2 : null
            }), open ? /* @__PURE__ */ jsx(ChevronUpIcon, {
              className: "h-5 w-5 text-primary-400",
              "aria-hidden": "true"
            }) : /* @__PURE__ */ jsx(ChevronDownIcon, {
              className: "h-5 w-5 text-primary-400",
              "aria-hidden": "true"
            })]
          }), /* @__PURE__ */ jsx(We$1, {
            as: react.exports.Fragment,
            enter: "transition ease-out duration-200",
            enterFrom: "opacity-0 tranprimary-y-1",
            enterTo: "opacity-100 tranprimary-y-0",
            leave: "transition ease-in duration-150",
            leaveFrom: "opacity-100 tranprimary-y-0",
            leaveTo: "opacity-0 tranprimary-y-1",
            children: /* @__PURE__ */ jsx(mt.Panel, {
              className: "absolute left-0 z-10 mt-1 w-[500px] transform px-4 sm:px-0",
              children: /* @__PURE__ */ jsx("div", {
                className: "overflow-hidden rounded-lg shadow-xl ring-1 ring-black ring-opacity-5",
                children: /* @__PURE__ */ jsxs("div", {
                  className: "relative grid bg-primary-800",
                  children: [/* @__PURE__ */ jsx("div", {
                    className: "px-4 pt-4 pb-4 border-b border-b-primary-700",
                    children: /* @__PURE__ */ jsx(En, {
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
              "value": "swapHistory"
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
              "value": "addLiquidityHistory"
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
              "value": "removeLiquidityHistory"
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
    children: /* @__PURE__ */ jsxs(_n, {
      className: "max-w-[960px] w-full max-h-full overflow-auto px-0",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex justify-between mb-4 px-6",
        children: [/* @__PURE__ */ jsx(bn, {
          children: "Transactions"
        }), /* @__PURE__ */ jsx("div", {
          className: "flex gap-2 mb-4",
          children: actionButtonProps.map((props) => /* @__PURE__ */ jsx(Ke, {
            onClick: props.onClick,
            size: "sm",
            variant: "basic",
            children: props.children
          }, props.children))
        })]
      }), /* @__PURE__ */ jsx(Tn, {
        ...tableProps
      })]
    })
  });
}
function PoolsEventTableContainer({}) {
  var _a, _b, _c, _d;
  const {
    coinx,
    coiny
  } = useParams();
  const poolQuery = useQuery(PoolDocument, {
    variables: {
      poolInput: {
        coinTypeX: coinx != null ? coinx : "",
        coinTypeY: coiny != null ? coiny : ""
      }
    },
    skip: !coinx || !coiny
  });
  const pool = (_a = poolQuery == null ? void 0 : poolQuery.data) == null ? void 0 : _a.pool;
  const [filterBy, setFilterBy] = react.exports.useState(3);
  const swapTableData = ((_b = pool == null ? void 0 : pool.swapHistory) != null ? _b : []).map(({
    amountIn,
    amountOut,
    coinInfoIn,
    coinInfoOut
  }) => {
    var _a2, _b2, _c2;
    return {
      lpCoinType: (_a2 = pool == null ? void 0 : pool.coinInfoLP.coinType) != null ? _a2 : "",
      amountIn,
      amountOut,
      time: (_b2 = DateTime.fromJSDate(randRecentDate()).toRelative()) != null ? _b2 : "-",
      totalValue: (_c2 = pool == null ? void 0 : pool.amountLP) != null ? _c2 : 0,
      symbolIn: coinInfoIn.symbol,
      symbolOut: coinInfoOut.symbol,
      type: `Swap ${coinInfoIn.symbol} for ${coinInfoOut.symbol}`
    };
  });
  const addLiquidityTableData = ((_c = pool == null ? void 0 : pool.addLiquidityHistory) != null ? _c : []).map(({
    amountAddedX,
    amountAddedY,
    amountMintedLP
  }) => {
    var _a2, _b2, _c2, _d2, _e, _f;
    return {
      lpCoinType: (_a2 = pool == null ? void 0 : pool.coinInfoLP.coinType) != null ? _a2 : "",
      amountIn: amountAddedX,
      amountOut: amountAddedY,
      time: (_b2 = DateTime.fromJSDate(randRecentDate()).toRelative()) != null ? _b2 : "-",
      totalValue: amountMintedLP != null ? amountMintedLP : "-",
      symbolIn: (_c2 = pool == null ? void 0 : pool.coinInfoX.symbol) != null ? _c2 : "-",
      symbolOut: (_d2 = pool == null ? void 0 : pool.coinInfoY.symbol) != null ? _d2 : "-",
      type: `Add ${(_e = pool == null ? void 0 : pool.coinInfoX.symbol) != null ? _e : ""} and ${(_f = pool == null ? void 0 : pool.coinInfoY.symbol) != null ? _f : ""}`
    };
  });
  const removeLiquidityTableData = ((_d = pool == null ? void 0 : pool.removeLiquidityHistory) != null ? _d : []).map(({
    amountBurnedLP,
    amountRemovedX,
    amountRemovedY
  }) => {
    var _a2, _b2, _c2, _d2, _e, _f;
    return {
      lpCoinType: (_a2 = pool == null ? void 0 : pool.coinInfoLP.coinType) != null ? _a2 : "",
      amountIn: amountRemovedX,
      amountOut: amountRemovedY,
      time: (_b2 = DateTime.fromJSDate(randRecentDate()).toRelative()) != null ? _b2 : "-",
      totalValue: amountBurnedLP != null ? amountBurnedLP : "-",
      symbolIn: (_c2 = pool == null ? void 0 : pool.coinInfoX.symbol) != null ? _c2 : "-",
      symbolOut: (_d2 = pool == null ? void 0 : pool.coinInfoY.symbol) != null ? _d2 : "-",
      type: `Remove ${(_e = pool == null ? void 0 : pool.coinInfoX.symbol) != null ? _e : ""} and ${(_f = pool == null ? void 0 : pool.coinInfoY.symbol) != null ? _f : ""}`
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
    children: "Deposits",
    onClick() {
      setFilterBy(1);
    }
  }, {
    children: "Withdrawals",
    onClick() {
      setFilterBy(2);
    }
  }];
  const poolTableProps = {
    data: tableData,
    columns: [{
      accessorKey: "type",
      header: "Event Type"
    }, {
      accessorKey: "totalValue",
      header: "Total Value"
    }, {
      accessorKey: "amountAuIn",
      header: "Token In (Au)",
      cell(c) {
        const value = c.getValue();
        return `${value} ${pool == null ? void 0 : pool.coinInfoX.symbol}`;
      }
    }, {
      accessorKey: "amountAuOut",
      header: "Token Out (Au)",
      cell(c) {
        const value = c.getValue();
        return `${value} ${pool == null ? void 0 : pool.coinInfoY.symbol}`;
      }
    }, {
      accessorKey: "lpCoinType",
      header: "Account"
    }, {
      accessorKey: "time",
      header: "Time"
    }]
  };
  return /* @__PURE__ */ jsx(PoolsEventTableView, {
    tableProps: poolTableProps,
    actionButtonProps
  });
}
const AddLiquidity = "";
const CoinList = "";
function CoinListItem({
  onCoinSelect,
  ...coinInfo
}) {
  react.exports.useCallback(() => onCoinSelect(coinInfo), [onCoinSelect, coinInfo]);
  return /* @__PURE__ */ jsxs(Do.Option, {
    value: coinInfo,
    className: "h-[60px] w-full flex items-center space-x-4 bg-transparent cursor-pointer p-4 rounded-lg hover:cursor-pointer hover:bg-secondary-800 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50",
    children: [/* @__PURE__ */ jsx(zr, {
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
  return /* @__PURE__ */ jsx(kn, {
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
  return /* @__PURE__ */ jsxs(_n, {
    className: "bg-primary-700 min-w-[400px] min-h-[200px]",
    children: [/* @__PURE__ */ jsx(bn, {
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
      children: [coin ? /* @__PURE__ */ jsx(zr, {
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
  return /* @__PURE__ */ jsxs(_n, {
    className: "w-[700px] mx-auto self-center",
    children: [/* @__PURE__ */ jsx(bn, {
      className: "mb-4",
      children: "Add Liquidity"
    }), /* @__PURE__ */ jsx(se, {
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
    }), /* @__PURE__ */ jsx(Ke, {
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
function AddLiquidityContainer({}) {
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
  const priceQuery = useLastTradePrice([{
    baseCoinType: firstCoin.coinType,
    quoteCoinType: secondCoin.coinType
  }]);
  const conversion = react.exports.useMemo(() => {
    var _a;
    return (_a = priceQuery.data) == null ? void 0 : _a.lastTradePrice;
  }, [priceQuery.data]);
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
      var _a;
      await (wallet == null ? void 0 : wallet.signAndSubmitTransaction((_a = res.data) == null ? void 0 : _a.addLiquidity));
    }).finally(() => navigate("/pools"));
  }
  const handleChangeSecondCoinAu = (e2) => {
  };
  react.exports.useEffect(() => {
    setSecondCoinAu(firstCoinAu * (conversion != null ? conversion : 0));
  }, [conversion, firstCoinAu]);
  const handleChangeFirstCoinAu = (e2) => {
    const v = Number(e2.currentTarget.value);
    setFirstCoinAu(v);
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
  return !firstCoin && !secondCoin ? /* @__PURE__ */ jsxs(_n, {
    className: "flex flex-col gap-8 w-[700px] mx-auto self-center",
    children: [notFoundMsg, /* @__PURE__ */ jsx(Ke, {
      onClick: goBackToPools,
      children: "Back to pools"
    })]
  }) : /* @__PURE__ */ jsxs(_n, {
    className: "flex flex-col gap-8 w-[700px] mx-auto self-center",
    children: [/* @__PURE__ */ jsxs(_n, {
      className: "p-8 text-white flex flex-col gap-8",
      children: ["Remove Liquidity", /* @__PURE__ */ jsx(On, {
        value: pctVal,
        onChange: setPctVal,
        min: 0,
        max: 100
      }), /* @__PURE__ */ jsx("span", {
        className: "text-6xl text-white font-bold",
        children: `${pctVal}%`
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex w-full justify-evenly",
        children: [/* @__PURE__ */ jsx(Ke, {
          onClick: () => setPctVal(25),
          children: "25%"
        }), /* @__PURE__ */ jsx(Ke, {
          onClick: () => setPctVal(50),
          children: "50%"
        }), /* @__PURE__ */ jsx(Ke, {
          onClick: () => setPctVal(75),
          children: "75%"
        }), /* @__PURE__ */ jsx(Ke, {
          onClick: () => setPctVal(100),
          children: "Max"
        })]
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "w-full flex justify-center",
      children: /* @__PURE__ */ jsx(ArrowDownIcon, {
        className: "w-8 text-white"
      })
    }), /* @__PURE__ */ jsxs(_n, {
      className: "flex flex-col gap-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex justify-between text-white",
        children: [/* @__PURE__ */ jsx("div", {
          children: firstCoinAmount
        }), /* @__PURE__ */ jsx("div", {
          className: "flex gap-4 justify-end",
          children: (firstCoin == null ? void 0 : firstCoin.symbol) ? /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsx(zr, {
              coin: firstCoin == null ? void 0 : firstCoin.symbol
            }), " ", firstCoin == null ? void 0 : firstCoin.symbol]
          }) : /* @__PURE__ */ jsx(Fragment, {
            children: "No coin selected"
          })
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex justify-between text-white",
        children: [/* @__PURE__ */ jsx("div", {
          children: secondCoinAmount
        }), /* @__PURE__ */ jsx("div", {
          className: "flex gap-4 justify-end",
          children: (secondCoin == null ? void 0 : secondCoin.symbol) ? /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsx(zr, {
              coin: secondCoin == null ? void 0 : secondCoin.symbol
            }), " ", secondCoin == null ? void 0 : secondCoin.symbol]
          }) : /* @__PURE__ */ jsx(Fragment, {
            children: "No coin selected"
          })
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex justify-between text-white",
      children: [/* @__PURE__ */ jsx("div", {
        children: "Price: "
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex gap-4",
          children: firstCoinRelativePrice ? `1 ${firstCoin == null ? void 0 : firstCoin.symbol} = ${firstCoinRelativePrice} ${secondCoin == null ? void 0 : secondCoin.symbol}` : "Pricing information unavailable."
        }), /* @__PURE__ */ jsx("div", {
          className: "flex gap-4",
          children: secondCoinRelativePrice ? `1 ${secondCoin == null ? void 0 : secondCoin.symbol} = ${secondCoinRelativePrice} ${firstCoin == null ? void 0 : firstCoin.symbol}` : "Pricing information unavailable."
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex justify-between",
      children: [/* @__PURE__ */ jsx(Ke, {
        onClick: handleRemoveLiquidity,
        children: "Confirm"
      }), /* @__PURE__ */ jsx(Ke, {
        onClick: goBackToPools,
        children: "Cancel"
      })]
    })]
  });
}
function RemoveLiquidityContainer({}) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n2, _o, _p, _q, _r2, _s, _t, _u, _v, _w, _x;
  const navigate = useNavigate();
  const [removeLiquidityMutation, removeLiquidityResult] = useMutation(RemoveLiquidityDocument);
  const [wallet] = useWallet();
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
    skip: !firstCoin
  });
  const firstCoinRelativePriceQuery = useLastTradePrice([{
    baseCoinType: (_e = (_d = (_c = poolQuery.data) == null ? void 0 : _c.pool) == null ? void 0 : _d.coinInfoX.coinType) != null ? _e : "",
    quoteCoinType: (_h = (_g = (_f = poolQuery.data) == null ? void 0 : _f.pool) == null ? void 0 : _g.coinInfoY.coinType) != null ? _h : ""
  }]);
  const secondCoinRelativePriceQuery = useLastTradePrice([{
    baseCoinType: (_k = (_j = (_i = poolQuery.data) == null ? void 0 : _i.pool) == null ? void 0 : _j.coinInfoY.coinType) != null ? _k : "",
    quoteCoinType: (_n2 = (_m = (_l = poolQuery.data) == null ? void 0 : _l.pool) == null ? void 0 : _m.coinInfoX.coinType) != null ? _n2 : ""
  }]);
  const [pctVal, setPctVal] = react.exports.useState(0);
  const handleRemoveLiquidity = react.exports.useCallback(async function handleRemoveLiquidity2() {
    var _a2;
    const res = await removeLiquidityMutation({
      variables: {
        removeLiquidityInput: {
          amountLP: pctVal,
          poolInput: {
            coinTypeX: firstCoin.coinType,
            coinTypeY: secondCoin.coinType
          }
        }
      }
    });
    const tx = (_a2 = res.data) == null ? void 0 : _a2.removeLiquidity;
    await (wallet == null ? void 0 : wallet.signAndSubmitTransaction(tx));
    navigate("/pools");
  }, [firstCoin, secondCoin, pctVal, navigate, removeLiquidityMutation, wallet]);
  const notFoundMsg = `Cannot find coins for types ${firstCoin == null ? void 0 : firstCoin.symbol} and ${secondCoin == null ? void 0 : secondCoin.symbol}`;
  return /* @__PURE__ */ jsx(RemoveLiquidityView, {
    firstCoin,
    firstCoinAmount: (_q = (_p = (_o = poolQuery.data) == null ? void 0 : _o.pool) == null ? void 0 : _p.amountX) != null ? _q : 0,
    firstCoinRelativePrice: (_s = (_r2 = firstCoinRelativePriceQuery.data) == null ? void 0 : _r2.lastTradePrice) != null ? _s : 0,
    secondCoinRelativePrice: (_u = (_t = secondCoinRelativePriceQuery.data) == null ? void 0 : _t.lastTradePrice) != null ? _u : 0,
    secondCoinAmount: (_x = (_w = (_v = poolQuery.data) == null ? void 0 : _v.pool) == null ? void 0 : _w.amountY) != null ? _x : 0,
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
  var _a, _b, _c;
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
        children: pool && /* @__PURE__ */ jsx(wn, {
          coins: [pool == null ? void 0 : pool.coinInfoX.symbol, pool == null ? void 0 : pool.coinInfoY.symbol],
          size: 48
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "self-center ml-4 text-4xl",
        children: `${pool == null ? void 0 : pool.coinInfoX.name} / ${pool == null ? void 0 : pool.coinInfoY.name}`
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex",
      children: [/* @__PURE__ */ jsx(Cn, {
        title: `${pool == null ? void 0 : pool.coinInfoX.name} Locked`,
        value: (_a = pool == null ? void 0 : pool.amountX) != null ? _a : "-"
      }), /* @__PURE__ */ jsx(Cn, {
        title: `${pool == null ? void 0 : pool.coinInfoY.name} Locked`,
        value: (_b = pool == null ? void 0 : pool.amountY) != null ? _b : "-"
      }), /* @__PURE__ */ jsx(Cn, {
        title: "Fee Percent",
        value: (_c = pool == null ? void 0 : pool.feePercent) != null ? _c : "-"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex gap-4 mt-6",
      children: [/* @__PURE__ */ jsx(Ke, {
        onClick: () => setAddOpen(true),
        variant: "buy",
        size: "sm",
        children: "Adds"
      }), /* @__PURE__ */ jsx(Ke, {
        onClick: () => setRemoveOpen(true),
        variant: "sell",
        size: "sm",
        children: "Removes"
      })]
    }), /* @__PURE__ */ jsx(PoolsEventTableContainer, {}), /* @__PURE__ */ jsx(We$1, {
      appear: true,
      show: isAddOpen,
      as: react.exports.Fragment,
      children: /* @__PURE__ */ jsxs(gt, {
        as: "div",
        className: "relative z-10",
        onClose: () => setAddOpen(false),
        children: [/* @__PURE__ */ jsx(We$1.Child, {
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
            children: /* @__PURE__ */ jsx(We$1.Child, {
              as: react.exports.Fragment,
              enter: "ease-out duration-300",
              enterFrom: "opacity-0 scale-95",
              enterTo: "opacity-100 scale-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100 scale-100",
              leaveTo: "opacity-0 scale-95",
              children: /* @__PURE__ */ jsx(gt.Panel, {
                className: "m-w-[700px] bg-primary-900 transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all",
                children: /* @__PURE__ */ jsx(AddLiquidityContainer, {})
              })
            })
          })
        })]
      })
    }), /* @__PURE__ */ jsx(We$1, {
      appear: true,
      show: isRemoveOpen,
      as: react.exports.Fragment,
      children: /* @__PURE__ */ jsxs(gt, {
        as: "div",
        className: "relative z-10",
        onClose: () => setRemoveOpen(false),
        children: [/* @__PURE__ */ jsx(We$1.Child, {
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
            children: /* @__PURE__ */ jsx(We$1.Child, {
              as: react.exports.Fragment,
              enter: "ease-out duration-300",
              enterFrom: "opacity-0 scale-95",
              enterTo: "opacity-100 scale-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100 scale-100",
              leaveTo: "opacity-0 scale-95",
              children: /* @__PURE__ */ jsx(gt.Panel, {
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
  const {
    coinx,
    coiny
  } = useParams();
  const poolQuery = useQuery(PoolDocument, {
    variables: {
      poolInput: {
        coinTypeX: coinx != null ? coinx : "",
        coinTypeY: coiny != null ? coiny : ""
      }
    }
  });
  const pool = react.exports.useMemo(() => {
    var _a, _b;
    return (_b = (_a = poolQuery.data) == null ? void 0 : _a.pool) != null ? _b : null;
  }, [poolQuery.data]);
  return /* @__PURE__ */ jsx(PoolView, {
    pool
  });
}
const PortfolioDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "Portfolio"
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
              "value": "address"
            }
          }, {
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
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "deposits"
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
                  "value": "amount"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "withdrawals"
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
                  "value": "amount"
                }
              }]
            }
          }, {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "transfers"
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
                  "value": "from"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "to"
                }
              }, {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "amount"
                }
              }]
            }
          }, {
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
          }, {
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
          }, {
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
function PortfolioView({
  positions
}) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const [wallet, , connection] = useWallet();
  const query = useQuery(PortfolioDocument, {
    variables: {
      owner: connection == null ? void 0 : connection.address
    }
  });
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
  const onCancelOrder = (id) => {
    console.log(id);
  };
  const orderColumns = [{
    accessorKey: "side",
    header: "Side",
    cell: (cell) => {
      const value = cell.getValue();
      return /* @__PURE__ */ jsx("span", {
        className: value === "buy" ? "text-green-400" : "text-red-400",
        children: value
      });
    }
  }, {
    accessorKey: "market",
    header: "Market",
    cell: (cell) => {
      const value = cell.getValue();
      console.log(cell);
      return /* @__PURE__ */ jsx(Link, {
        to: "/trade",
        children: value
      });
    }
  }, {
    accessorKey: "quantity",
    header: "Quantity"
  }, {
    accessorKey: "price",
    header: "Price"
  }, {
    accessorKey: "kind",
    header: "Type"
  }, {
    accessorKey: "date",
    header: "Date"
  }, {
    accessorKey: "status",
    header: "Status",
    cell: (cell) => {
      const value = cell.getValue();
      const variant = getBadgeVariant(value);
      return /* @__PURE__ */ jsx(yn, {
        size: "sm",
        variant,
        children: value
      });
    }
  }, {
    accessorKey: "id",
    header: "",
    cell: (cell) => {
      const value = cell.getValue();
      onCancelOrder(value);
      return /* @__PURE__ */ jsx("div", {
        className: "w-[24px] h-[24px] color-primary-300 rounded-full p-1 ml-2 self-center cursor-pointer hover:bg-primary-700 hover:color-white ",
        children: /* @__PURE__ */ jsx(XMarkIcon, {})
      });
    }
  }];
  const orderData = (_c = (_b = (_a = query.data) == null ? void 0 : _a.account) == null ? void 0 : _b.openOrders.map(({
    side,
    baseCoinType,
    quoteCoinType,
    price,
    orderType,
    time,
    quantity
  }) => ({
    side,
    market: `${baseCoinType}-${quoteCoinType}`,
    price,
    date: new Date(time).toString(),
    quantity,
    kind: orderType
  }))) != null ? _c : [];
  const orderHistoryData = (_f = (_e = (_d = query.data) == null ? void 0 : _d.account) == null ? void 0 : _e.orderHistory.map(({
    side,
    baseCoinType,
    quoteCoinType,
    price,
    orderType,
    time,
    quantity
  }) => ({
    side,
    market: `${baseCoinType}-${quoteCoinType}`,
    price,
    date: new Date(time).toString(),
    quantity,
    kind: orderType,
    quote: quoteCoinType,
    base: baseCoinType
  }))) != null ? _f : [];
  const filledOrderColumns = [{
    accessorKey: "side",
    header: "Side",
    cell: (cell) => {
      const value = cell.getValue();
      return /* @__PURE__ */ jsx("span", {
        className: value === "buy" ? "text-green-400" : "text-red-400",
        children: value
      });
    }
  }, {
    accessorKey: "quantity",
    header: "Quantity"
  }, {
    accessorKey: "price",
    header: "Price"
  }, {
    accessorKey: "kind",
    header: "Type"
  }, {
    accessorKey: "date",
    header: "Date"
  }, {
    accessorKey: "status",
    header: "Status",
    cell: (cell) => {
      const value = cell.getValue();
      const variant = getBadgeVariant(value);
      return /* @__PURE__ */ jsx(yn, {
        size: "sm",
        variant,
        children: value
      });
    }
  }];
  const filledOrderData = orderHistoryData;
  const holdingsData = (_h = (_g = query.data) == null ? void 0 : _g.account) == null ? void 0 : _h.balances.map(({
    availableBalance,
    balance,
    coinInfo
  }) => ({
    name: coinInfo.name,
    balance,
    balanceValue: availableBalance,
    symbol: coinInfo.symbol
  }));
  const poolData = (_j = (_i = query.data) == null ? void 0 : _i.account) == null ? void 0 : _j.poolPositions.map(({
    coinInfoX,
    coinInfoY,
    share,
    amountX,
    amountY,
    coinInfoLP
  }) => ({
    name: coinInfoLP.name,
    share,
    coinInfoX,
    coinInfoY,
    amountX,
    amountY
  }));
  const truncatedAddress = (connection == null ? void 0 : connection.address) ? `${connection.address.slice(0, 4)}...${connection.address.slice(connection.address.length - 4, connection.address.length)}` : "-";
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col justify-self-stretch w-full h-full p-6",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-row mx-3",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mr-10",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-3xl",
          children: "My Portfolio"
        }), /* @__PURE__ */ jsxs("div", {
          className: "inline-flex mt-2",
          children: [/* @__PURE__ */ jsx("p", {
            className: "",
            children: truncatedAddress
          }), /* @__PURE__ */ jsx("a", {
            href: "",
            className: "w-[16px] h-[16px] rounded-full self-center ml-2",
            target: "_blank",
            children: /* @__PURE__ */ jsx(Square2StackIcon, {
              className: "-rotate-90"
            })
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "flex"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "grid grid-cols-6 grid-rows-2 gap-4 m-3",
      children: [/* @__PURE__ */ jsx(_n, {
        className: "sm:col-span-6 md:col-span-4 md:row-span-2 h-full",
        children: /* @__PURE__ */ jsxs(Ge$1.Group, {
          children: [/* @__PURE__ */ jsxs(Ge$1.List, {
            className: "mb-8 border-b-2 border-primary-600",
            children: [/* @__PURE__ */ jsx(Ge$1, {
              className: "px-4 py-2 text-primary-200 border-b-4 border-transparent ui-selected:border-brand ui-selected:text-white",
              children: "Open Orders"
            }), /* @__PURE__ */ jsx(Ge$1, {
              className: "px-4 py-2 text-primary-200 border-b-4 border-transparent ui-selected:border-brand ui-selected:text-white",
              children: "Filled Orders"
            })]
          }), /* @__PURE__ */ jsxs(Ge$1.Panels, {
            children: [/* @__PURE__ */ jsx(Ge$1.Panel, {
              children: /* @__PURE__ */ jsx(Tn, {
                columns: orderColumns,
                data: orderData
              })
            }), /* @__PURE__ */ jsx(Ge$1.Panel, {
              children: /* @__PURE__ */ jsx(Tn, {
                columns: filledOrderColumns,
                data: filledOrderData
              })
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs(_n, {
        className: "sm:col-span-6 md:col-span-2",
        children: [/* @__PURE__ */ jsx(bn, {
          children: "Holdings"
        }), holdingsData == null ? void 0 : holdingsData.map((coin, index2) => /* @__PURE__ */ jsxs("div", {
          className: "p-2 my-2 flex flex-row content-center rounded-xl bg-primary-800 shadow-md",
          children: [/* @__PURE__ */ jsx(zr, {
            size: 32,
            coin: coin.symbol
          }), /* @__PURE__ */ jsx("div", {
            className: "self-center ml-4 mr-auto",
            children: coin.name
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col text-right self-center",
            children: [/* @__PURE__ */ jsx("div", {
              className: "text-md",
              children: coin.balance
            }), /* @__PURE__ */ jsx("div", {
              className: "text-xs",
              children: coin.balanceValue
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "w-[32px] h-[32px] color-primary-300 hover:bg-primary-700 rounded-full p-1 ml-2 self-center",
            children: /* @__PURE__ */ jsx(EllipsisVerticalIcon, {})
          })]
        }, `${coin.name}-${index2}`))]
      }), /* @__PURE__ */ jsxs(_n, {
        className: "sm:col-span-6 md:col-span-2",
        children: [/* @__PURE__ */ jsx(bn, {
          children: "Pools"
        }), poolData == null ? void 0 : poolData.map((pool, index2) => /* @__PURE__ */ jsxs("div", {
          className: "p-4 my-2 flex flex-row items-center rounded-xl bg-primary-800 shadow-md",
          children: [/* @__PURE__ */ jsx(wn, {
            coins: [pool.coinInfoX.symbol, pool.coinInfoY.symbol]
          }), /* @__PURE__ */ jsxs("div", {
            className: "ml-4 mr-4",
            children: [pool.coinInfoX.name, /* @__PURE__ */ jsx("div", {
              className: "text-sm text-primary-200",
              children: pool.amountX
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "ml-4 mr-auto",
            children: [pool.coinInfoY.name, /* @__PURE__ */ jsx("div", {
              className: "text-sm text-primary-200",
              children: pool.amountY
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "ml-4 mr-auto",
            children: ["Share:", /* @__PURE__ */ jsx("div", {
              className: "text-sm text-primary-200",
              children: pool.share
            })]
          })]
        }, `${pool.coinInfoX.name}-${index2}`))]
      })]
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
  const marketsQuery = useQuery(TradingViewMarketsDocument);
  const markets = react.exports.useMemo(() => {
    var _a;
    return (_a = marketsQuery.data) == null ? void 0 : _a.markets;
  }, [marketsQuery.data]);
  const allSymbols = react.exports.useMemo(() => {
    var _a;
    return (_a = markets == null ? void 0 : markets.map((c) => ({
      symbol: `${c.name}`,
      full_name: `${c.name}`,
      exchange: "AUX",
      type: "crypto"
    }))) != null ? _a : [];
  }, [markets]);
  const dataFeed = {
    onReady: (callback) => {
      setTimeout(() => callback(configurationData));
    },
    searchSymbols: async (userInput, exchange, symbolType, onResultReadyCallback) => {
      const symbols = allSymbols;
      const newSymbols = symbols.filter((symbol) => {
        const isExchangeValid = exchange === "" || symbol.exchange === exchange;
        const isFullSymbolContainsInput = symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
        return isExchangeValid && isFullSymbolContainsInput;
      });
      onResultReadyCallback(newSymbols);
    },
    resolveSymbol: async (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
      const symbols = allSymbols;
      const symbolItem = symbols.find(({
        full_name
      }) => full_name === symbolName);
      if (!symbolItem) {
        onResolveErrorCallback("cannot resolve symbol");
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
    },
    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
      var _a, _b, _c, _d;
      const {
        from,
        to,
        firstDataRequest,
        countBack
      } = periodParams;
      try {
        const market = markets == null ? void 0 : markets.find((m) => m.name === symbolInfo.ticker);
        const data = market && await client.query({
          query: TradingViewQueryDocument,
          variables: {
            resolution: Resolution.Days_1,
            marketInputs: [{
              baseCoinType: (_a = market == null ? void 0 : market.baseCoinInfo.coinType) != null ? _a : "",
              quoteCoinType: (_b = market == null ? void 0 : market.quoteCoinInfo.coinType) != null ? _b : ""
            }],
            offset: countBack
          }
        });
        if (!data || data.errors || !data.loading && !((_c = data.data.markets[0]) == null ? void 0 : _c.bars.length)) {
          onHistoryCallback([], {
            noData: true
          });
          return;
        }
        const bars = [];
        (_d = data.data.markets[0]) == null ? void 0 : _d.bars.forEach(({
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
    },
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
const MarketTradesDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "subscription",
    "name": {
      "kind": "Name",
      "value": "MarketTrades"
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
          "value": "trade"
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
              "value": "time"
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
          }]
        }
      }]
    }
  }]
};
const MarketQueryDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "MarketQuery"
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
    }, {
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
            }],
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "time"
                }
              }, {
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
  const [wallet, , connection] = useWallet();
  useQuery(MarketQueryDocument, {
    variables: {
      owner: connection == null ? void 0 : connection.address,
      marketInput: {
        baseCoinType: firstCoin == null ? void 0 : firstCoin.coinType,
        quoteCoinType: secondCoin == null ? void 0 : secondCoin.coinType
      },
      resolution: Resolution.Days_1
    },
    skip: !firstCoin || !secondCoin
  });
  const marketTradesSubscription = useSubscription(MarketTradesDocument, {
    variables: {
      marketInputs: [{
        baseCoinType: firstCoin == null ? void 0 : firstCoin.coinType,
        quoteCoinType: secondCoin == null ? void 0 : secondCoin.coinType
      }]
    },
    skip: !firstCoin || !secondCoin
  });
  const [marketTrades, setMarketTrades] = react.exports.useState([]);
  React.useEffect(() => {
    setMarketTrades((prev) => {
      var _a2, _b, _c;
      if ((_a2 = marketTradesSubscription.data) == null ? void 0 : _a2.trade) {
        if (prev.length === 50)
          prev.pop();
        const item = (_b = marketTradesSubscription.data) == null ? void 0 : _b.trade;
        if (item) {
          item.time = (_c = DateTime.fromJSDate(randRecentDate()).toRelative()) != null ? _c : "";
          return [item, ...prev];
        }
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
    className: "p-0 h-full mt-3 max-h-full",
    children: /* @__PURE__ */ jsx("div", {
      ref: tableRef,
      className: "flex overflow-hidden relative overflow-y-scroll h-full max-h-full",
      children: /* @__PURE__ */ jsx(Tn, {
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
      return ((_a3 = a2 == null ? void 0 : a2.price) != null ? _a3 : 0) < ((_b2 = b == null ? void 0 : b.price) != null ? _b2 : 0) ? -1 : 1;
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
      className: "relative overflow-y-scroll h-full max-h-full pt-4",
      children: /* @__PURE__ */ jsx(Tn, {
        ...askOrderTableProps
      })
    }), /* @__PURE__ */ jsx("div", {
      ref: bidTableRef,
      className: "relative overflow-y-scroll h-full max-h-full pt-4",
      children: /* @__PURE__ */ jsx(Tn, {
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
  const orderBookQuery = useQuery(OrderBookQueryDocument, {
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
  react.exports.useEffect(() => {
    var _a, _b, _c, _d;
    const obd = (_b = (_a = orderBookQuery.data) == null ? void 0 : _a.market) == null ? void 0 : _b.orderbook;
    const maxLen = Math.min((_c = obd == null ? void 0 : obd.asks.length) != null ? _c : 0, (_d = obd == null ? void 0 : obd.asks.length) != null ? _d : 0, 25);
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
  }, [orderBookQuery.data]);
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
      }).applyOverrides({
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
  const {
    firstCoin,
    secondCoin,
    lastTradePrice
  } = useCoinXYParamState();
  const [activeTab, setActiveTab] = react.exports.useState(0);
  const [price, setPrice] = react.exports.useState(lastTradePrice);
  const [cxAmount, setCxAmount] = react.exports.useState(0);
  const [cyAmount, setCyAmount] = react.exports.useState(0);
  const [post, setPost] = react.exports.useState(false);
  const [ioc, setIOC] = react.exports.useState(false);
  const [orderType, setOrderType] = react.exports.useState(OrderType.Limit);
  const resetForm = () => {
    setActiveTab(0);
    setPrice(0);
    setCxAmount(0);
    setCyAmount(0);
    setPost(false);
    setIOC(false);
    setOrderType(OrderType.Limit);
  };
  const onChangeIOC = (val) => {
    if (post && val)
      setPost(false);
    setIOC(val);
  };
  const onChangePost = (val) => {
    if (ioc && val)
      setIOC(false);
    setPost(val);
  };
  const onChangePrice = react.exports.useCallback((e2) => {
    setPrice(Number(e2.currentTarget.value));
  }, []);
  const onChangeCxAmount = react.exports.useCallback((e2) => {
    setCxAmount(Number(e2.currentTarget.value));
  }, []);
  const onChangeCyAmount = react.exports.useCallback((e2) => {
    setCyAmount(Number(e2.currentTarget.value));
  }, []);
  const [placeOrderMutation] = useMutation(PlaceOrderDocument);
  const [wallet, , connection] = useWallet();
  const placeOrder = async (placeOrderInput) => {
    const tx = await placeOrderMutation({
      variables: {
        placeOrderInput
      }
    });
    await (wallet == null ? void 0 : wallet.signAndSubmitTransaction(tx));
  };
  const {
    addNotification
  } = Gt();
  const submitTrade = async () => {
    if (firstCoin && secondCoin && connection) {
      await placeOrder({
        auxToBurn: 0,
        clientOrderId: 0,
        orderType,
        limitPrice: price,
        marketInput: {
          baseCoinType: firstCoin == null ? void 0 : firstCoin.coinType,
          quoteCoinType: secondCoin == null ? void 0 : secondCoin.coinType
        },
        quantity: cxAmount,
        sender: connection == null ? void 0 : connection.address,
        side: activeTab === 1 ? Side.Buy : Side.Sell
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
    setActiveTab
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
    submitTrade
  } = useTradeControls();
  useWallet();
  const orderTypeOptions = Object.entries(OrderType).map(([key, val]) => ({
    value: val,
    label: key
  }));
  const selectedOrderType = orderTypeOptions.find(({
    value
  }) => value === orderType);
  const {
    firstCoin,
    secondCoin,
    lastTradePrice
  } = useCoinXYParamState();
  const tabs = [{
    label: "Buy",
    variant: "buy"
  }, {
    label: "Sell",
    variant: "sell"
  }];
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col w-full h-full gap-3 p-4",
    children: [/* @__PURE__ */ jsx(Ge$1.Group, {
      onChange: setActiveTab,
      children: /* @__PURE__ */ jsx(Sn, {
        tabs
      })
    }), /* @__PURE__ */ jsx(xn, {
      options: Object.entries(OrderType).map(([key, val]) => ({
        value: val,
        label: key
      })),
      label: "Type",
      onChange: onChangeOrderType,
      value: selectedOrderType,
      className: "w-full min-w-full"
    }), /* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx(En, {
        className: "w-full",
        value: priceInput,
        onChange: onChangePrice,
        name: "price",
        label: "Price",
        suffix: secondCoin == null ? void 0 : secondCoin.symbol
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex w-full gap-2 pt-2",
        children: [/* @__PURE__ */ jsx(Ke, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "Mid"
        }), /* @__PURE__ */ jsx(Ke, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "Bid"
        }), /* @__PURE__ */ jsx(Ke, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "-1%"
        }), /* @__PURE__ */ jsx(Ke, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "-5%"
        }), /* @__PURE__ */ jsx(Ke, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "-10%"
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx(En, {
        value: cxAmount,
        onChange: onChangeCxAmount,
        name: "coinx",
        label: "Amount",
        suffix: firstCoin == null ? void 0 : firstCoin.symbol,
        className: "w-full"
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex w-full gap-2 pt-2",
        children: [/* @__PURE__ */ jsx(Ke, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "25%"
        }), /* @__PURE__ */ jsx(Ke, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "50%"
        }), /* @__PURE__ */ jsx(Ke, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "75%"
        }), /* @__PURE__ */ jsx(Ke, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "Max"
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex gap-6 my-2",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-start gap-2",
        children: ["IOC", /* @__PURE__ */ jsx(Rn, {
          enabled: ioc,
          onChange: onChangeIOC
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-start gap-2",
        children: ["Post", /* @__PURE__ */ jsx(Rn, {
          enabled: post,
          onChange: onChangePost
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col py-3 border-t border-t-primary-700 gap-2",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex justify-between text-primary-400 text-sm",
        children: [/* @__PURE__ */ jsx("div", {
          className: "font-medium",
          children: "Subtotal"
        }), /* @__PURE__ */ jsx("div", {
          className: "font-semibold",
          children: priceInput * cxAmount
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex justify-between text-primary-400 text-sm",
        children: [/* @__PURE__ */ jsx("div", {
          className: "font-medium",
          children: "Fee"
        }), /* @__PURE__ */ jsx("div", {
          className: "font-semibold",
          children: "12.345"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex justify-between text-lg border-t border-t-primary-700 pt-3",
        children: [/* @__PURE__ */ jsx("div", {
          className: "font-medium",
          children: "Total"
        }), /* @__PURE__ */ jsx("div", {
          className: "font-bold",
          children: "12.345"
        })]
      })]
    }), /* @__PURE__ */ jsx(Ke, {
      onClick: submitTrade,
      size: "sm",
      children: "Submit Trade"
    })]
  });
}
function usePositionsTable() {
  var _a, _b, _c, _d, _e, _f;
  const positions = usePositions();
  const tableRef = react.exports.useRef(null);
  const tableProps = {
    data: (_c = (_b = (_a = positions.data) == null ? void 0 : _a.account) == null ? void 0 : _b.poolPositions) != null ? _c : [],
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
      count: (_f = (_e = (_d = positions.data) == null ? void 0 : _d.account) == null ? void 0 : _e.poolPositions.length) != null ? _f : 0,
      estimateSize: () => {
        var _a2, _b2, _c2;
        return (_c2 = (_b2 = (_a2 = positions.data) == null ? void 0 : _a2.account) == null ? void 0 : _b2.poolPositions.length) != null ? _c2 : 0;
      },
      getScrollElement: () => tableRef.current
    }
  };
  return [tableProps, tableRef];
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
function useOpenOrdersTable() {
  var _a, _b, _c;
  const [wallet, , connection] = useWallet();
  const [cancelOrder] = useMutation(CancelOrderDocument);
  const orders = useOrders();
  const tableRef = react.exports.useRef(null);
  const tableProps = {
    data: (_c = (_b = (_a = orders.data) == null ? void 0 : _a.account) == null ? void 0 : _b.openOrders.map(({
      time,
      ...order
    }) => {
      var _a2;
      return {
        ...order,
        time: (_a2 = DateTime.fromJSDate(new Date(Number(time))).toRelative()) != null ? _a2 : ""
      };
    })) != null ? _c : [],
    columns: [{
      accessorKey: "side",
      header: "Side"
    }, {
      accessorKey: "price",
      header: "price"
    }, {
      accessorKey: "quantity",
      header: "quantity"
    }, {
      accessorKey: "orderType",
      header: "Order Type"
    }, {
      accessorKey: "time",
      header: "Time"
    }, {
      accessorKey: "orderId",
      header: "",
      cell: (cell) => {
        var _a2, _b2, _c2;
        const value = cell.getValue();
        const idx = cell.row.index;
        const cellValue = (_c2 = (_b2 = (_a2 = orders.data) == null ? void 0 : _a2.account) == null ? void 0 : _b2.openOrders) == null ? void 0 : _c2[idx];
        const onCancelOrder = async () => {
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
          wallet == null ? void 0 : wallet.signAndSubmitTransaction(tx);
        };
        return /* @__PURE__ */ jsx("button", {
          onClick: onCancelOrder,
          className: "w-[24px] h-[24px] cursor-pointer bg-primary-500 rounded-full hover:bg-primary-700 hover:text-white",
          children: /* @__PURE__ */ jsx(XMarkIcon$1, {})
        });
      }
    }]
  };
  return [tableProps, tableRef];
}
function useOrderHistoryTable() {
  var _a, _b, _c, _d;
  const orders = useOrders();
  const tableRef = react.exports.useRef(null);
  const orderHistory = (_b = (_a = orders.data) == null ? void 0 : _a.account) == null ? void 0 : _b.orderHistory;
  const tableProps = {
    data: (_c = orderHistory == null ? void 0 : orderHistory.map(({
      time,
      ...order
    }) => {
      var _a2;
      return {
        ...order,
        time: (_a2 = DateTime.fromJSDate(new Date(Number(time))).toRelative()) != null ? _a2 : ""
      };
    })) != null ? _c : [],
    columns: [{
      accessorKey: "orderStatus",
      header: "Order Status"
    }, {
      accessorKey: "side",
      header: "Side"
    }, {
      accessorKey: "price",
      header: "price"
    }, {
      accessorKey: "quantity",
      header: "quantity"
    }, {
      accessorKey: "orderType",
      header: "Order Type"
    }, {
      accessorKey: "time",
      header: "Time"
    }],
    virtualizeOptions: {
      count: (_d = orderHistory == null ? void 0 : orderHistory.length) != null ? _d : 0,
      estimateSize: () => {
        var _a2;
        return (_a2 = orderHistory == null ? void 0 : orderHistory.length) != null ? _a2 : 0;
      },
      getScrollElement: () => tableRef.current,
      overscan: 20
    }
  };
  return [tableProps, tableRef];
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
  var _a, _b, _c, _d;
  const tradeHistoryQuery = useTradeHistory();
  const tableRef = react.exports.useRef(null);
  const marketCoins = useMarketCoins();
  const getMarketCoinByType = (coinType) => marketCoins.find((mc) => mc.coinType === coinType);
  const tradeHistory = (_b = (_a = tradeHistoryQuery.data) == null ? void 0 : _a.account) == null ? void 0 : _b.tradeHistory;
  const tableProps = {
    data: (_c = tradeHistory == null ? void 0 : tradeHistory.map(({
      time,
      ...trade
    }) => {
      var _a2;
      return {
        ...trade,
        time: (_a2 = DateTime.fromJSDate(new Date(Number(time))).toRelative()) != null ? _a2 : ""
      };
    })) != null ? _c : [],
    columns: [{
      accessorKey: "side",
      header: "Side"
    }, {
      accessorKey: "baseCoinType",
      header: "Coin X",
      cell(cell) {
        var _a2;
        const val = cell.getValue();
        const name = (_a2 = getMarketCoinByType(val)) == null ? void 0 : _a2.name;
        console.log(name);
        return name != null ? name : "-";
      }
    }, {
      accessorKey: "quoteCoinType",
      header: "Coin Y",
      cell(cell) {
        var _a2;
        const val = cell.getValue();
        const name = (_a2 = getMarketCoinByType(val)) == null ? void 0 : _a2.name;
        console.log(name);
        return name != null ? name : "-";
      }
    }, {
      accessorKey: "side",
      header: "Side"
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
      count: (_d = tradeHistory == null ? void 0 : tradeHistory.length) != null ? _d : 0,
      estimateSize: () => {
        var _a2;
        return (_a2 = tradeHistory == null ? void 0 : tradeHistory.length) != null ? _a2 : 0;
      },
      getScrollElement: () => tableRef.current,
      overscan: 20
    }
  };
  return [tableProps, tableRef];
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
  var _a, _b, _c;
  const balancesQuery = useBalances();
  const tableRef = react.exports.useRef(null);
  useMarketCoins();
  const balances = (_b = (_a = balancesQuery.data) == null ? void 0 : _a.account) == null ? void 0 : _b.balances;
  const tableProps = {
    data: balances != null ? balances : [],
    columns: [{
      accessorKey: "coinInfo",
      header: "",
      cell(cell) {
        const coinInfo = cell.getValue();
        return /* @__PURE__ */ jsx(zr, {
          coin: coinInfo == null ? void 0 : coinInfo.symbol,
          size: 32
        });
      }
    }, {
      accessorKey: "coinInfo",
      header: "Symbol",
      cell(cell) {
        var _a2;
        const coinInfo = cell.getValue();
        return (_a2 = coinInfo == null ? void 0 : coinInfo.symbol) != null ? _a2 : "-";
      }
    }, {
      accessorKey: "availableBalance",
      header: "Available Balance"
    }, {
      accessorKey: "balance",
      header: "Balance"
    }],
    virtualizeOptions: {
      count: (_c = balances == null ? void 0 : balances.length) != null ? _c : 0,
      estimateSize: () => {
        var _a2;
        return (_a2 = balances == null ? void 0 : balances.length) != null ? _a2 : 0;
      },
      getScrollElement: () => tableRef.current,
      overscan: 20
    }
  };
  return [tableProps, tableRef];
}
function TradeView({}) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const createTradingView = useCreateTradingView();
  const lastPriceRef = react.exports.useRef(0);
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
  const price = lastTradePrice;
  react.exports.useEffect(() => {
    const s2 = Math.sign(lastTradePrice - lastPriceRef.current);
    lastPriceRef.current = lastTradePrice;
    if (s2 < 0)
      setPriceDirection("down");
    if (s2 > 0)
      setPriceDirection("up");
  }, [lastTradePrice]);
  const onSelectMarket = (m) => {
    createTradingView({
      symbol: m.name,
      interval: "1D"
    });
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
  const [orderTableTab, setOrderTableTab] = react.exports.useState(0);
  const marketEventTabs = [{
    label: "Order Book"
  }, {
    label: "Market Trades"
  }];
  const [marketEventTab, setMarketEventTab] = react.exports.useState(0);
  const [positionTableProps, positionTableRef] = usePositionsTable();
  const [openOrderTableProps, openOrderTableRef] = useOpenOrdersTable();
  const [orderHistoryTableProps, orderHistoryTableRef] = useOrderHistoryTable();
  const [tradeHistoryTableProps, tradeHistoryTableRef] = useTradeHistoryTable();
  const [balanceTableProps, balanceTableRef] = useBalancesTable();
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
        return positionTableRef;
    }
  }
  function getTableProps(tab) {
    switch (tab) {
      case 0:
        return openOrderTableProps;
      case 1:
        return orderHistoryTableProps;
      case 2:
        return tradeHistoryTableProps;
      case 3:
        return balanceTableProps;
      default:
        return positionTableProps;
    }
  }
  return /* @__PURE__ */ jsxs("div", {
    className: " bg-primary-900 w-full grid sm:grid-cols-1 sm:grid-rows-5 md:grid-rows-[76px_1fr_1fr_300px] md:grid-cols-[275px_275px_1fr_1fr_1fr_1fr] overflow-hidden",
    children: [/* @__PURE__ */ jsxs("div", {
      className: " sm:col-span-1 md:col-span-1 sm:row-span-1 md:row-span-4 h-full md:border-r md:border-r-primary-700",
      children: [/* @__PURE__ */ jsx("div", {
        className: "flex px-4 pt-3 w-full",
        children: /* @__PURE__ */ jsx(MarketSelector, {
          onSelectMarket
        })
      }), /* @__PURE__ */ jsx(TradingForm, {})]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex items-center md:col-span-5",
      children: [/* @__PURE__ */ jsx(Cn, {
        title: "",
        value: price,
        priceDirection,
        valueChange: 54.25,
        percentChange: 1.7,
        className: "mx-1 ml-1"
      }), /* @__PURE__ */ jsx(Cn, {
        title: "24hr High",
        value: (_c = (_b = (_a = marketQuery.data) == null ? void 0 : _a.market) == null ? void 0 : _b.high24h) != null ? _c : "-",
        className: "mx-1"
      }), /* @__PURE__ */ jsx(Cn, {
        title: "24hr Low",
        value: (_f = (_e = (_d = marketQuery.data) == null ? void 0 : _d.market) == null ? void 0 : _e.low24h) != null ? _f : "-",
        className: "mx-1"
      }), /* @__PURE__ */ jsx(Cn, {
        title: "24hr Volume",
        value: (_i = (_h = (_g = marketQuery.data) == null ? void 0 : _g.market) == null ? void 0 : _h.volume24h) != null ? _i : "-",
        className: "ml-1"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: " md:col-span-1 md:row-span-4 h-full md:border-r md:border-t md:border-t-primary-700 md:border-r-primary-700",
      children: [/* @__PURE__ */ jsx(Ge$1.Group, {
        selectedIndex: marketEventTab,
        onChange: setMarketEventTab,
        children: /* @__PURE__ */ jsx(Sn, {
          tabs: marketEventTabs
        })
      }), marketEventTab === 0 ? /* @__PURE__ */ jsx(OrderBookContainer, {
        price,
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
        children: /* @__PURE__ */ jsx(Sn, {
          tabs: orderTableTabs
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "max-w-full w-full h-full overflow-y-scroll mt-3 max-h-[250px]",
        ref: getTableRef(orderTableTab),
        children: /* @__PURE__ */ jsx(Tn, {
          ...getTableProps(orderTableTab)
        })
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
  const NO_POOLS_UI = /* @__PURE__ */ jsx(_n, {
    className: "text-center mt-[200px] max-w-[400px] self-center border-primary-700 border",
    children: "No Pools Available"
  });
  const renderLiquidityItem = (pool) => {
    var _a2;
    return /* @__PURE__ */ jsxs(_n, {
      className: "flex justify-between hover:bg-primary-900/70 hover:cursor-pointer border-primary-700 border",
      onClick: () => goToPoolInfo(pool.coinInfoX.coinType, pool.coinInfoY.coinType),
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex items-center",
          children: /* @__PURE__ */ jsx(wn, {
            coins: [pool.coinInfoX.symbol, pool.coinInfoY.symbol],
            size: 48
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "self-center ml-4 text-xl",
          children: `${pool.coinInfoX.name} / ${pool.coinInfoY.name}`
        })]
      }), /* @__PURE__ */ jsx(Cn, {
        title: `${pool.coinInfoX.name} Locked`,
        value: 146794.317623
      }), /* @__PURE__ */ jsx(Cn, {
        title: `${pool.coinInfoY.name} Locked`,
        value: 146794.317623
      }), /* @__PURE__ */ jsx(Cn, {
        title: "Fee Perecent",
        value: (_a2 = pool.feePercent) != null ? _a2 : "-"
      }), /* @__PURE__ */ jsx(Ke, {
        size: "sm",
        className: "h-auto self-center",
        onClick: () => goToPoolInfo(pool.coinInfoX.coinType, pool.coinInfoY.coinType),
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
      }), /* @__PURE__ */ jsx(Ke, {
        size: "sm",
        onClick: () => goToAddLiquidity(),
        className: "self-center",
        children: "Create Pool"
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "flex flex-col gap-4 max-w-[1280px] w-full",
      children: (_a = pools == null ? void 0 : pools.map(renderLiquidityItem)) != null ? _a : NO_POOLS_UI
    })]
  });
}
function PoolsContainer({}) {
  var _a, _b, _c;
  const navigate = useNavigate();
  const poolsQuery = useQuery(AllPoolsDocument);
  return /* @__PURE__ */ jsx(PoolsView, {
    pools: (_c = (_b = (_a = poolsQuery.data) == null ? void 0 : _a.pools) == null ? void 0 : _b.filter(Boolean)) != null ? _c : null,
    goToAddLiquidity: (coinx, coiny) => {
      if (coinx && coiny) {
        navigate(`/add-liquidity?coinx=${coinx}&coiny=${coiny}`);
      } else
        navigate("/add-liquidity");
    },
    goToRemoveLiquidity: (coinx, coiny) => {
      if (coinx && coiny) {
        navigate(`/remove-liquidity?coinx=${coinx}&coiny=${coiny}`);
      } else
        navigate("/remove-liquidity");
    },
    goToPoolInfo: (coinx, coiny) => navigate(`/pool/${coinx}/${coiny}`)
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
  const connectEl = /* @__PURE__ */ jsx(Ke, {
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
    })]
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
      children: [/* @__PURE__ */ jsx(se, {
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
        value: disabled ? value.toFixed(coin == null ? void 0 : coin.decimals) : value,
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
  return /* @__PURE__ */ jsxs(_n, {
    className: "w-[700px] mx-auto self-center justify-self-center",
    children: [/* @__PURE__ */ jsx(bn, {
      className: "mb-4",
      children: "Swap"
    }), /* @__PURE__ */ jsx(SwapPanel, {
      title: "From",
      coins: coins.filter((c) => c !== secondaryCoin),
      coin: primaryCoin,
      onCoinSelect: onSelectPrimary,
      setValue,
      value
    }), /* @__PURE__ */ jsx(SwapButton, {
      onClick: invertSelections
    }), /* @__PURE__ */ jsx(SwapPanel, {
      title: "To",
      coins: coins.filter((c) => c !== primaryCoin),
      coin: secondaryCoin,
      onCoinSelect: onSelectSecondary,
      value: conversion,
      setValue: () => {
      }
    }), /* @__PURE__ */ jsx(Ke, {
      className: "mt-6",
      onClick: handleSwap,
      children: "Swap"
    })]
  });
}
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
function usePoolPrice(input) {
  const poolPrice = useQuery(PoolPriceInDocument, {
    variables: input
  });
  return poolPrice;
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
  const [value, setValue] = react.exports.useState(1);
  const firstCoinPrice = usePoolPrice({
    amount: value,
    coinTypeIn: firstCoin == null ? void 0 : firstCoin.coinType,
    poolInput: {
      coinTypeX: firstCoin == null ? void 0 : firstCoin.coinType,
      coinTypeY: secondCoin == null ? void 0 : secondCoin.coinType
    }
  });
  const conversion = value * Number((_c = (_b = (_a = firstCoinPrice.data) == null ? void 0 : _a.pool) == null ? void 0 : _b.priceIn) != null ? _c : 0);
  const invertSelections = react.exports.useCallback(() => {
    const pc = firstCoin;
    const sc = secondCoin;
    if (pc && sc) {
      onFirstCoinSelect(sc);
      onSecondCoinSelect(pc);
    }
  }, [firstCoin, secondCoin, onFirstCoinSelect, onSecondCoinSelect]);
  const [wallet] = useWallet();
  const [swapMutation, swapResult] = useMutation(SwapDocument);
  const handleSwap = react.exports.useCallback(async () => {
    var _a2;
    const swapTx = await swapMutation({
      variables: {
        swapInput: {
          amountIn: value,
          coinTypeIn: firstCoin.coinType,
          coinTypeOut: secondCoin.coinType,
          minAmountOut: conversion,
          poolInput: {
            coinTypeX: firstCoin.coinType,
            coinTypeY: secondCoin.coinType
          }
        }
      }
    });
    await (wallet == null ? void 0 : wallet.signAndSubmitTransaction((_a2 = swapTx.data) == null ? void 0 : _a2.swap));
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
  cache: new InMemoryCache()
});
function App() {
  return /* @__PURE__ */ jsx(ApolloProvider, {
    client,
    children: /* @__PURE__ */ jsx(WalletProvider, {
      children: /* @__PURE__ */ jsx(BrowserRouter, {
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col h-full w-full",
          children: [/* @__PURE__ */ jsx(vn, {}), /* @__PURE__ */ jsx(Header, {}), /* @__PURE__ */ jsx("div", {
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
                  path: "/pool/:coinx/:coiny",
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
  });
}
const index = "";
client$1.createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsx(React.StrictMode, {
  children: /* @__PURE__ */ jsx(App, {})
}));
