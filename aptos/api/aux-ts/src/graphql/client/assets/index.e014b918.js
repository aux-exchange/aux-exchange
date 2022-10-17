var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { c as create$1, r as react, W as We, g as gt, R as React, p as pt, m as mt, q as qe, O as Oe, u as useAnimationControls, a as motion, b as useNavigate, d as useLocation, e as be, G as Ge, S as Slider, f as useReactTable, h as flexRender, i as getCoreRowModel, j as getSortedRowModel, k as jsx, F as Fragment, l as jsxs, n as useSubscription, o as useQuery, C as ChevronUpIcon, s as ChevronDownIcon, M as MagnifyingGlassIcon, t as useParams, D as DateTime, v as randRecentDate, w as Do, x as useMutation, A as ArrowDownIcon, L as Link, y as ArrowLongLeftIcon, z as Square2StackIcon, E as EllipsisVerticalIcon, X as XMarkIcon, B as linear, H as colors_1, I as XMarkIcon$1, N as NavLink, J as ArrowsUpDownIcon, K as HttpLink, P as GraphQLWsLink, Q as createClient, T as split, U as getMainDefinition, V as ApolloClient, Y as InMemoryCache, Z as ApolloProvider, _ as BrowserRouter, $ as Routes, a0 as Route, a1 as client$1 } from "./vendor.1e2b8011.js";
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
function z(e2, n2) {
  if (Object.is(e2, n2))
    return true;
  if (typeof e2 != "object" || e2 === null || typeof n2 != "object" || n2 === null)
    return false;
  const i2 = Object.keys(e2);
  if (i2.length !== Object.keys(n2).length)
    return false;
  for (let r = 0; r < i2.length; r++)
    if (!Object.prototype.hasOwnProperty.call(n2, i2[r]) || !Object.is(e2[i2[r]], n2[i2[r]]))
      return false;
  return true;
}
let _;
const Pt = new Uint8Array(16);
function Kt() {
  if (!_ && (_ = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !_))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return _(Pt);
}
const I = [];
for (let e2 = 0; e2 < 256; ++e2)
  I.push((e2 + 256).toString(16).slice(1));
function qt(e2, n2 = 0) {
  return (I[e2[n2 + 0]] + I[e2[n2 + 1]] + I[e2[n2 + 2]] + I[e2[n2 + 3]] + "-" + I[e2[n2 + 4]] + I[e2[n2 + 5]] + "-" + I[e2[n2 + 6]] + I[e2[n2 + 7]] + "-" + I[e2[n2 + 8]] + I[e2[n2 + 9]] + "-" + I[e2[n2 + 10]] + I[e2[n2 + 11]] + I[e2[n2 + 12]] + I[e2[n2 + 13]] + I[e2[n2 + 14]] + I[e2[n2 + 15]]).toLowerCase();
}
const Wt = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), Qe = {
  randomUUID: Wt
};
function Xt(e2, n2, i2) {
  if (Qe.randomUUID && !n2 && !e2)
    return Qe.randomUUID();
  e2 = e2 || {};
  const r = e2.random || (e2.rng || Kt)();
  if (r[6] = r[6] & 15 | 64, r[8] = r[8] & 63 | 128, n2) {
    i2 = i2 || 0;
    for (let o2 = 0; o2 < 16; ++o2)
      n2[i2 + o2] = r[o2];
    return n2;
  }
  return qt(r);
}
var D = /* @__PURE__ */ ((e2) => (e2.basic = "basic", e2.error = "error", e2.warning = "warning", e2.info = "info", e2.success = "success", e2))(D || {});
const ye = create$1((e2) => ({
  notifications: [],
  addNotification(n2) {
    return e2((i2) => ({
      ...i2,
      notifications: i2.notifications.concat({
        ...n2,
        id: Xt()
      })
    }));
  },
  removeNotification(n2) {
    return e2((i2) => ({
      ...i2,
      notifications: i2.notifications.filter((r) => n2 !== r)
    }));
  }
}));
function _t() {
  const e2 = ye((r) => r.notifications, z), n2 = ye((r) => r.addNotification, z);
  return {
    removeNotification: ye((r) => r.removeNotification, z),
    addNotification: n2,
    notifications: e2
  };
}
const $ = create$1((e2) => ({
  params: new URLSearchParams(window.location.search),
  setParams: (n2) => e2((i2) => ({
    params: new URLSearchParams(n2)
  })),
  addParams: (...n2) => e2((i2) => {
    const r = i2.params;
    return n2.forEach(({
      key: o2,
      value: l
    }) => {
      if (!r.has(o2))
        r.append(o2, l);
      else {
        const h = `${r.get(o2)},${l}`;
        r.set(o2, h);
      }
    }), {
      params: new URLSearchParams(r)
    };
  }),
  removeParams: (...n2) => e2((i2) => {
    const r = i2.params;
    return n2.forEach(({
      key: o2,
      value: l
    }) => {
      if (r.has(o2)) {
        const c = r.get(o2);
        if (c) {
          const h = c.split(",").filter((d) => d !== l);
          h.length ? r.set(o2, h.join(",")) : r.delete(o2);
        }
      }
    }), {
      params: new URLSearchParams(r)
    };
  })
}));
function vn() {
  const e2 = useNavigate(), n2 = useLocation(), i2 = $((c) => c.params, z), r = $((c) => c.setParams, z), o2 = $((c) => c.addParams, z), l = $((c) => c.removeParams, z);
  return react.exports.useEffect(() => {
    const c = `${n2.pathname}?${new URLSearchParams(n2.search).toString()}`;
    `${n2.pathname}?${i2.toString()}` !== c && e2(`${n2.pathname}?${i2.toString()}`);
  }, [i2.toString(), n2]), {
    params: i2,
    setParams: r,
    addParams: o2,
    removeParams: l
  };
}
function _e(e2) {
  var n2, i2, r = "";
  if (typeof e2 == "string" || typeof e2 == "number")
    r += e2;
  else if (typeof e2 == "object")
    if (Array.isArray(e2))
      for (n2 = 0; n2 < e2.length; n2++)
        e2[n2] && (i2 = _e(e2[n2])) && (r && (r += " "), r += i2);
    else
      for (n2 in e2)
        e2[n2] && (r && (r += " "), r += n2);
  return r;
}
function $t() {
  for (var e2, n2, i2 = 0, r = ""; i2 < arguments.length; )
    (e2 = arguments[i2++]) && (n2 = _e(e2)) && (r && (r += " "), r += n2);
  return r;
}
const er = (e2) => typeof e2 == "boolean", tr = (e2) => er(e2) ? String(e2) : e2, rr = (e2, n2) => Object.entries(e2).every(([i2, r]) => n2[i2] === r);
function nr(e2) {
  return (n2, i2) => {
    const r = Object.entries(n2).reduce((h, [d, f]) => f === void 0 ? h : {
      ...h,
      [d]: f
    }, {}), o2 = {
      ...e2.defaultVariants,
      ...r
    }, l = Object.keys(e2.variants).map((h) => e2.variants[h][tr(n2[h]) || e2.defaultVariants[h]]), c = e2.compoundVariants.reduce((h, {
      classes: d,
      ...f
    }) => (rr(f, o2) && d && h.push(d), h), []);
    return $t([e2.base, l, c, i2]);
  };
}
const ir = nr({
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
var ie = { exports: {} }, H = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Te;
function or() {
  if (Te)
    return H;
  Te = 1;
  var e2 = React, n2 = Symbol.for("react.element"), i2 = Symbol.for("react.fragment"), r = Object.prototype.hasOwnProperty, o2 = e2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, l = { key: true, ref: true, __self: true, __source: true };
  function c(h, d, f) {
    var m, v = {}, y = null, x = null;
    f !== void 0 && (y = "" + f), d.key !== void 0 && (y = "" + d.key), d.ref !== void 0 && (x = d.ref);
    for (m in d)
      r.call(d, m) && !l.hasOwnProperty(m) && (v[m] = d[m]);
    if (h && h.defaultProps)
      for (m in d = h.defaultProps, d)
        v[m] === void 0 && (v[m] = d[m]);
    return { $$typeof: n2, type: h, key: y, ref: x, props: v, _owner: o2.current };
  }
  return H.Fragment = i2, H.jsx = c, H.jsxs = c, H;
}
(function(e2) {
  e2.exports = or();
})(ie);
const $e = ie.exports.Fragment, s$1 = ie.exports.jsx, C = ie.exports.jsxs;
function Pe({
  className: e2,
  children: n2,
  variant: i2,
  size: r,
  element: o2,
  onClick: l
}) {
  const c = ir({
    size: r,
    variant: i2
  }, e2), d = (() => {
    switch (o2) {
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
  return /* @__PURE__ */ s$1(d, {
    onClick: l,
    className: c,
    children: n2
  });
}
function ar({
  title: e2,
  titleId: n2,
  ...i2
}, r) {
  return /* @__PURE__ */ C("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, i2),
    children: [e2 ? /* @__PURE__ */ s$1("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ s$1("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
    })]
  });
}
const lr = react.exports.forwardRef(ar), cr = lr;
function ur({
  title: e2,
  titleId: n2,
  ...i2
}, r) {
  return /* @__PURE__ */ C("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, i2),
    children: [e2 ? /* @__PURE__ */ s$1("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ s$1("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
    })]
  });
}
const dr = react.exports.forwardRef(ur), hr = dr;
function fr({
  title: e2,
  titleId: n2,
  ...i2
}, r) {
  return /* @__PURE__ */ C("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, i2),
    children: [e2 ? /* @__PURE__ */ s$1("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ s$1("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    })]
  });
}
const pr = react.exports.forwardRef(fr), mr = pr;
function yr({
  title: e2,
  titleId: n2,
  ...i2
}, r) {
  return /* @__PURE__ */ C("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, i2),
    children: [e2 ? /* @__PURE__ */ s$1("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ s$1("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M19.5 8.25l-7.5 7.5-7.5-7.5"
    })]
  });
}
const gr = react.exports.forwardRef(yr), vr = gr;
function Cr({
  title: e2,
  titleId: n2,
  ...i2
}, r) {
  return /* @__PURE__ */ C("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, i2),
    children: [e2 ? /* @__PURE__ */ s$1("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ s$1("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M4.5 15.75l7.5-7.5 7.5 7.5"
    })]
  });
}
const Er = react.exports.forwardRef(Cr), xr = Er;
function wr({
  title: e2,
  titleId: n2,
  ...i2
}, r) {
  return /* @__PURE__ */ C("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, i2),
    children: [e2 ? /* @__PURE__ */ s$1("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ s$1("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
    })]
  });
}
const br = react.exports.forwardRef(wr), Rr = br;
function Or({
  title: e2,
  titleId: n2,
  ...i2
}, r) {
  return /* @__PURE__ */ C("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, i2),
    children: [e2 ? /* @__PURE__ */ s$1("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ s$1("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
    })]
  });
}
const kr = react.exports.forwardRef(Or), Ir = kr;
function Ur({
  title: e2,
  titleId: n2,
  ...i2
}, r) {
  return /* @__PURE__ */ C("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, i2),
    children: [e2 ? /* @__PURE__ */ s$1("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ s$1("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M6 18L18 6M6 6l12 12"
    })]
  });
}
const jr = react.exports.forwardRef(Ur), Yr = jr;
function Cn() {
  var v;
  const {
    removeNotification: e2,
    notifications: n2
  } = _t(), i2 = react.exports.useRef(n2[0]), r = useAnimationControls(), [o2, l] = react.exports.useState(n2[0]), c = "flex items-start absolute bottom-8 right-8 bg-primary-800 w-[400px] h-auto p-4 text-cyan-700 z-50 opacity-0 border-l-4", h = {
    [D.basic]: " border-l-secondary-400",
    [D.error]: " border-l-red-400",
    [D.success]: " border-l-green-400",
    [D.info]: " border-l-secondary-400",
    [D.warning]: " "
  }, d = {
    duration: 0.3,
    ease: "easeInOut"
  }, f = react.exports.useRef(false);
  react.exports.useEffect(() => (f.current = true, () => {
    f.current = false;
  }), []), react.exports.useEffect(() => {
    o2 && r.start({
      opacity: 1,
      x: [200, 0],
      transition: d
    });
  }, [o2]), react.exports.useEffect(() => {
    var y;
    if (n2.length && JSON.stringify(i2.current) !== JSON.stringify(n2[0])) {
      const x = n2[0];
      l(x), i2.current = x;
      const R = setTimeout(async () => {
        await r.start({
          opacity: [1, 0],
          x: [0, 200],
          transition: d
        }), e2(x), l(void 0);
      }, (y = x.dismissAfter) != null ? y : 3e3);
      return () => {
        r.stop(), f.current || clearTimeout(R);
      };
    }
  }, [n2, e2, r]);
  const m = react.exports.useCallback(async (y) => {
    y.preventDefault(), o2 && (e2(o2), await r.start({
      opacity: [1, 0],
      x: [0, 200],
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }), l(void 0));
  }, [r, e2, o2]);
  return /* @__PURE__ */ C(motion.div, {
    className: c + ((o2 == null ? void 0 : o2.type) != null ? h[o2 == null ? void 0 : o2.type] : null),
    animate: r,
    children: [(o2 == null ? void 0 : o2.type) === D.error ? /* @__PURE__ */ s$1(Rr, {
      className: "w-10 h-10 text-red-400"
    }) : (o2 == null ? void 0 : o2.type) === D.success ? /* @__PURE__ */ s$1(mr, {
      className: "w-10 h-10 text-green-400"
    }) : (o2 == null ? void 0 : o2.type) === D.info ? /* @__PURE__ */ s$1(Ir, {
      className: "w-10 h-10 text-secondary-400"
    }) : null, /* @__PURE__ */ C("div", {
      className: "flex flex-col ml-3 w-full",
      children: [/* @__PURE__ */ C("div", {
        className: "flex items-center justify-between text-lg font-semibold",
        children: [/* @__PURE__ */ s$1("div", {
          className: "mr-auto",
          children: o2 == null ? void 0 : o2.title
        }), /* @__PURE__ */ s$1(Pe, {
          size: "xs",
          variant: "basic",
          className: "border-0 bg-none",
          onClick: m,
          children: /* @__PURE__ */ s$1(Yr, {
            className: "w-4 h-4"
          })
        })]
      }), /* @__PURE__ */ s$1("div", {
        className: "text-white",
        children: o2 == null ? void 0 : o2.message
      }), /* @__PURE__ */ s$1("div", {
        children: (v = o2 == null ? void 0 : o2.actions) == null ? void 0 : v.map((y, x) => /* @__PURE__ */ s$1(Pe, {
          ...y
        }, x))
      })]
    })]
  });
}
function En({
  children: e2,
  className: n2,
  id: i2
}) {
  const r = `font-semibold text-lg text-white ${n2}`;
  return /* @__PURE__ */ s$1("div", {
    id: i2,
    className: r,
    children: e2
  });
}
function oe({
  children: e2,
  className: n2,
  htmlFor: i2
}) {
  const r = `font-bold text-xs text-primary-400 uppercase mb-1 ${n2}`, l = (() => i2 ? "label" : "div")();
  return /* @__PURE__ */ s$1(l, {
    htmlFor: i2,
    className: r,
    children: e2
  });
}
const Vr = ({
  size: e2
}) => /* @__PURE__ */ C("svg", {
  width: e2,
  height: e2,
  baseProfile: "tiny",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 112 112",
  xmlSpace: "preserve",
  children: [/* @__PURE__ */ s$1("circle", {
    fill: "#FFFFFF",
    cx: "56",
    cy: "56",
    r: "56"
  }), /* @__PURE__ */ s$1("path", {
    fill: "black",
    d: "M86.6 37.4h-9.9c-1.1 0-2.2-.5-3-1.3l-4-4.5c-1.2-1.3-3.1-1.4-4.5-.3l-.3.3-3.4 3.9c-1.1 1.3-2.8 2-4.5 2H2.9C1.4 41.9.4 46.6 0 51.3h51.2c.9 0 1.8-.4 2.4-1l4.8-5c.6-.6 1.4-1 2.3-1h.2c.9 0 1.8.4 2.4 1.1l4 4.5c.8.9 1.9 1.4 3 1.4H112c-.4-4.7-1.4-9.4-2.9-13.8H86.6zM53.8 65l-4-4.5c-1.2-1.3-3.1-1.4-4.5-.3l-.3.3-3.5 3.9c-1.1 1.3-2.7 2-4.4 2H.8c.9 4.8 2.5 9.5 4.6 14h25.5c.9 0 1.7-.4 2.4-1l4.8-5c.6-.6 1.4-1 2.3-1h.2c.9 0 1.8.4 2.4 1.1l4 4.5c.8.9 1.9 1.4 3 1.4h56.6c2.1-4.4 3.7-9.1 4.6-14H56.8c-1.2 0-2.3-.5-3-1.4zm19.6-43.6 4.8-5c.6-.6 1.4-1 2.3-1h.2c.9 0 1.8.4 2.4 1l4 4.5c.8.9 1.9 1.3 3 1.3h10.8c-18.8-24.8-54.1-29.7-79-11-4.1 3.1-7.8 6.8-11 11H71c1 .2 1.8-.2 2.4-.8zM34.7 94.2c-1.2 0-2.3-.5-3-1.3l-4-4.5c-1.2-1.3-3.2-1.4-4.5-.2l-.2.2-3.5 3.9c-1.1 1.3-2.7 2-4.4 2h-.2C36 116.9 71.7 118 94.4 96.7c.9-.8 1.7-1.7 2.6-2.6H34.7z"
  })]
}), Nr = ({
  size: e2
}) => /* @__PURE__ */ s$1("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  height: e2,
  width: e2,
  children: /* @__PURE__ */ C("g", {
    fill: "none",
    fillRule: "evenodd",
    children: [/* @__PURE__ */ s$1("circle", {
      cx: "16",
      cy: "16",
      r: "16",
      fill: "#F7931A"
    }), /* @__PURE__ */ s$1("path", {
      fill: "#FFF",
      fillRule: "nonzero",
      d: "M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
    })]
  })
}), Jr = ({
  size: e2
}) => /* @__PURE__ */ s$1("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  width: e2,
  height: e2,
  children: /* @__PURE__ */ C("g", {
    fill: "none",
    fillRule: "evenodd",
    children: [/* @__PURE__ */ s$1("circle", {
      cx: "16",
      cy: "16",
      r: "16",
      fill: "#627EEA"
    }), /* @__PURE__ */ C("g", {
      fill: "#FFF",
      fillRule: "nonzero",
      children: [/* @__PURE__ */ s$1("path", {
        fillOpacity: ".602",
        d: "M16.498 4v8.87l7.497 3.35z"
      }), /* @__PURE__ */ s$1("path", {
        d: "M16.498 4L9 16.22l7.498-3.35z"
      }), /* @__PURE__ */ s$1("path", {
        fillOpacity: ".602",
        d: "M16.498 21.968v6.027L24 17.616z"
      }), /* @__PURE__ */ s$1("path", {
        d: "M16.498 27.995v-6.028L9 17.616z"
      }), /* @__PURE__ */ s$1("path", {
        fillOpacity: ".2",
        d: "M16.498 20.573l7.497-4.353-7.497-3.348z"
      }), /* @__PURE__ */ s$1("path", {
        fillOpacity: ".602",
        d: "M9 16.22l7.498 4.353v-7.701z"
      })]
    })]
  })
}), Ar = ({
  size: e2
}) => /* @__PURE__ */ s$1("svg", {
  width: e2,
  height: e2,
  viewBox: "0 0 32 32",
  xmlns: "http://www.w3.org/2000/svg",
  children: /* @__PURE__ */ C("g", {
    fill: "none",
    children: [/* @__PURE__ */ s$1("circle", {
      fill: "#66F9A1",
      cx: "16",
      cy: "16",
      r: "16"
    }), /* @__PURE__ */ s$1("path", {
      d: "M9.925 19.687a.59.59 0 01.415-.17h14.366a.29.29 0 01.207.497l-2.838 2.815a.59.59 0 01-.415.171H7.294a.291.291 0 01-.207-.498l2.838-2.815zm0-10.517A.59.59 0 0110.34 9h14.366c.261 0 .392.314.207.498l-2.838 2.815a.59.59 0 01-.415.17H7.294a.291.291 0 01-.207-.497L9.925 9.17zm12.15 5.225a.59.59 0 00-.415-.17H7.294a.291.291 0 00-.207.498l2.838 2.815c.11.109.26.17.415.17h14.366a.291.291 0 00.207-.498l-2.838-2.815z",
      fill: "#FFF"
    })]
  })
}), Mr = ({
  size: e2
}) => /* @__PURE__ */ s$1("svg", {
  width: e2,
  height: e2,
  viewBox: "0 0 32 32",
  xmlns: "http://www.w3.org/2000/svg",
  children: /* @__PURE__ */ C("g", {
    fill: "none",
    children: [/* @__PURE__ */ s$1("circle", {
      fill: "#3E73C4",
      cx: "16",
      cy: "16",
      r: "16"
    }), /* @__PURE__ */ C("g", {
      fill: "#FFF",
      children: [/* @__PURE__ */ s$1("path", {
        d: "M20.022 18.124c0-2.124-1.28-2.852-3.84-3.156-1.828-.243-2.193-.728-2.193-1.578 0-.85.61-1.396 1.828-1.396 1.097 0 1.707.364 2.011 1.275a.458.458 0 00.427.303h.975a.416.416 0 00.427-.425v-.06a3.04 3.04 0 00-2.743-2.489V9.142c0-.243-.183-.425-.487-.486h-.915c-.243 0-.426.182-.487.486v1.396c-1.829.242-2.986 1.456-2.986 2.974 0 2.002 1.218 2.791 3.778 3.095 1.707.303 2.255.668 2.255 1.639 0 .97-.853 1.638-2.011 1.638-1.585 0-2.133-.667-2.316-1.578-.06-.242-.244-.364-.427-.364h-1.036a.416.416 0 00-.426.425v.06c.243 1.518 1.219 2.61 3.23 2.914v1.457c0 .242.183.425.487.485h.915c.243 0 .426-.182.487-.485V21.34c1.829-.303 3.047-1.578 3.047-3.217z"
      }), /* @__PURE__ */ s$1("path", {
        d: "M12.892 24.497c-4.754-1.7-7.192-6.98-5.424-11.653.914-2.55 2.925-4.491 5.424-5.402.244-.121.365-.303.365-.607v-.85c0-.242-.121-.424-.365-.485-.061 0-.183 0-.244.06a10.895 10.895 0 00-7.13 13.717c1.096 3.4 3.717 6.01 7.13 7.102.244.121.488 0 .548-.243.061-.06.061-.122.061-.243v-.85c0-.182-.182-.424-.365-.546zm6.46-18.936c-.244-.122-.488 0-.548.242-.061.061-.061.122-.061.243v.85c0 .243.182.485.365.607 4.754 1.7 7.192 6.98 5.424 11.653-.914 2.55-2.925 4.491-5.424 5.402-.244.121-.365.303-.365.607v.85c0 .242.121.424.365.485.061 0 .183 0 .244-.06a10.895 10.895 0 007.13-13.717c-1.096-3.46-3.778-6.07-7.13-7.162z"
      })]
    })]
  })
}), Dr = ({
  size: e2
}) => /* @__PURE__ */ s$1("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  width: e2,
  height: e2,
  children: /* @__PURE__ */ C("g", {
    fill: "none",
    fillRule: "evenodd",
    children: [/* @__PURE__ */ s$1("circle", {
      cx: "16",
      cy: "16",
      r: "16",
      fill: "#26A17B"
    }), /* @__PURE__ */ s$1("path", {
      fill: "#FFF",
      d: "M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117"
    })]
  })
}), Lr = ({
  size: e2
}) => /* @__PURE__ */ C("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  height: e2,
  width: e2,
  children: [/* @__PURE__ */ s$1("circle", {
    cx: "16",
    cy: "16",
    r: "16",
    fill: "#0f172a",
    fillRule: "evenodd"
  }), /* @__PURE__ */ C("g", {
    fillRule: "nonzero",
    children: [/* @__PURE__ */ s$1("path", {
      d: "M20,18c.0002652,.0002652,.0000481,.0001922,.000139,.0005561l1.8785932,7.5143726c.0666973,.2667892,.3462678,.4850713,.6212678,.4850713h5c.275,0,.4454295-.2182821,.3787322-.4850713L23.1212678,6.4850713c-.0666973-.2667892-.3462678-.4850713-.6212678-.4850713H9.5c-.275,0-.5545705,.2182821-.6212678,.4850713L4.1212678,25.5149287c-.0666973,.2667892,.1037322,.4850713,.3787322,.4850713h5c.275,0,.5545705-.2182821,.6212678-.4850713l1.8787322-7.5149287m-.5-4c-.275,0-.4454295-.2182821-.3787322-.4850713l.7574644-3.0298575c.0666973-.2667892,.3462678-.4850713,.6212678-.4850713h7c.275,0,.5545705,.2182821,.6212678,.4850713l.7574644,3.0298575c.0666973,.2667892-.1037322,.4850713-.3787322,.4850713H11.5Z",
      fill: "#00aeef"
    }), /* @__PURE__ */ s$1("path", {
      d: "M25.9393661,13.7574644c.0333486,.1333946-.0518661,.2425356-.1893661,.2425356h-.5c-.1375,0-.2772853-.109141-.3106339-.2425356l-.8787322-3.5149287c-.0333486-.1333946,.0518661-.2425356,.1893661-.2425356h.5c.1375,0,.2772853,.109141,.3106339,.2425356l.8787322,3.5149287Z",
      fill: "#007aa7"
    }), /* @__PURE__ */ s$1("path", {
      d: "M7.0606339,13.7574644c-.0333486,.1333946-.1731339,.2425356-.3106339,.2425356h-.5c-.1375,0-.2227147-.109141-.1893661-.2425356l.8787322-3.5149287c.0333486-.1333946,.1731339-.2425356,.3106339-.2425356h.5c.1375,0,.2227147,.109141,.1893661,.2425356l-.8787322,3.5149287Z",
      fill: "#007aa7"
    }), /* @__PURE__ */ s$1("rect", {
      x: "15.5",
      y: "3",
      width: "1",
      height: "3",
      fill: "#007aa7"
    }), /* @__PURE__ */ s$1("rect", {
      x: "14.0000005",
      y: "2",
      width: "3.9999953",
      height: "1.0000001",
      rx: ".4999994",
      ry: ".4999994",
      fill: "#00aeef"
    })]
  })]
}), zr = `iVBORw0KGgoAAAANSUhEUgAAAQoAAAEICAYAAACnA7rCAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LjljY2M0ZGU5MywgMjAyMi8wMy8xNC0xNDowNzoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjMgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjQzMkM4N0QyRTlGMTFFREIxNERBMTg2NDQ4QjVEMTMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjQzMkM4N0UyRTlGMTFFREIxNERBMTg2NDQ4QjVEMTMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGNDMyQzg3QjJFOUYxMUVEQjE0REExODY0NDhCNUQxMyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNDMyQzg3QzJFOUYxMUVEQjE0REExODY0NDhCNUQxMyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnVszN0AAYTaSURBVHja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
`, Sr = ({
  size: e2
}) => /* @__PURE__ */ s$1("img", {
  width: e2,
  height: e2,
  src: zr
}), Fr = ({
  size: e2
}) => /* @__PURE__ */ C("svg", {
  width: e2,
  height: e2,
  viewBox: "0 0 510 510",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  children: [/* @__PURE__ */ s$1("circle", {
    x: "0.816406",
    y: "0.0366211",
    width: "509",
    height: "509.927",
    fill: "black"
  }), /* @__PURE__ */ s$1("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M304.903 59.8335C304.669 60.0192 303.691 61.4258 302.728 62.9593C292.436 79.3562 265.475 115.573 255.731 126.091C255.212 126.651 254.982 126.415 249.356 119.557C233.063 99.697 218.323 79.6886 208.226 63.726C205.147 58.8583 205.873 58.4236 180.902 80.0814C148.214 108.432 148.911 107.548 155.809 111.88C166.925 118.861 178.223 126.717 191.076 136.402C204.146 146.251 223.281 161.764 223.281 162.512C223.281 164.346 164.951 222.577 163.113 222.577C162.54 222.577 157.691 216.865 148.676 205.57C133.622 186.709 121.877 170.342 111.963 154.408C109.111 149.826 108.845 149.487 108.261 149.711C107.894 149.852 98.5034 159.945 91.957 167.233C63.0165 199.456 59.3262 204.506 63.0215 206.833C80.4551 217.813 108.324 238.491 124.931 252.769C127.395 254.887 127.728 254.334 120.331 260.398C99.7553 277.266 79.0772 292.423 61.8151 303.292C60.8409 303.905 60.007 304.601 59.9621 304.837C59.7382 306.016 91.3208 342.477 105.838 357.799C108.58 360.693 108.343 360.773 111.282 355.966C122.203 338.104 139.222 314.921 158.293 291.93C163.836 285.248 161.318 283.538 193.882 316.102C226.192 348.412 224.583 346.116 218.471 351.195C195.678 370.137 173.576 386.417 155.015 397.936C152.202 399.682 149.827 401.299 149.739 401.529C149.161 403.037 203.416 450.8 205.011 450.188C205.229 450.104 206.254 448.698 207.29 447.063C217.014 431.709 229.397 414.598 243.742 396.693C249 390.129 254.657 383.283 254.993 383.075C255.388 382.832 255.64 383.103 260.409 388.886C276.265 408.117 293.038 430.85 302.323 445.693C303.25 447.175 303.844 447.854 304.213 447.854C306.241 447.854 358.95 401.466 358.438 400.132C358.348 399.899 356.413 398.535 354.137 397.102C335.604 385.431 314.034 369.503 292.495 351.584C286.4 346.513 286.715 347.014 288.434 345.142C305.293 326.782 345.735 286.703 347.404 286.703C347.679 286.703 350.01 289.285 353.004 292.906C371.024 314.705 386.987 336.382 397.813 353.756C400.53 358.116 400.791 358.444 401.311 358.129C402.639 357.327 422.978 334.854 433.531 322.53C451.518 301.523 450.659 304.682 440.263 297.772C422.869 286.212 398.702 268.003 385.338 256.386C383.116 254.455 382.841 254.993 388.405 250.371C407.967 234.119 428.585 218.866 446.031 207.74C450.757 204.726 451.04 204.455 450.422 203.533C449.294 201.849 437.614 187.896 429.618 178.68C420.699 168.402 403.618 149.695 402.663 149.161C402.035 148.809 401.908 148.974 398.161 154.966C388.713 170.077 376.168 187.546 362.195 205.051C355.293 213.697 347.708 222.856 347.451 222.856C345.787 222.856 287.128 164.137 287.128 162.471C287.128 161.757 308.468 144.555 321.56 134.714C333.446 125.781 350.297 114.298 358.569 109.496C361.173 107.984 361.21 107.672 359.029 105.654C334.012 82.5093 306.1 58.8809 304.903 59.8335ZM261.533 134.125C267.441 141.003 278.114 153.046 283.462 158.869C287.014 162.736 287.248 162.002 280.645 167.677C274.187 173.227 264.048 182.206 259.036 186.815C254.951 190.57 255.514 190.51 252.268 187.542C246.922 182.654 234.397 171.567 229.332 167.238C223.048 161.867 222.98 163.309 229.875 155.732C235.659 149.377 246.195 137.403 251.833 130.779C255.588 126.367 254.565 126.014 261.533 134.125ZM263.07 197.617C272.393 206.31 302.476 236.349 310.823 245.3C314.255 248.98 317.625 252.581 318.312 253.302L319.562 254.614L317.076 257.324C303.785 271.819 278.692 297.049 262.521 312.178C258.572 315.873 255.373 318.983 255.412 319.089C255.579 319.541 272.02 334.231 280.785 341.76C287.403 347.445 287.384 346.135 280.954 353.198C274.656 360.118 265.747 370.225 259.943 377.037C255.576 382.16 255.364 382.38 255.01 382.16C254.888 382.085 252.188 378.988 249.011 375.278C243.154 368.441 232.482 356.402 227.089 350.55C223.474 346.627 223.465 347.055 227.235 343.856C235.907 336.497 255.065 319.415 255.065 319.041C255.065 318.942 251.332 315.361 246.77 311.083C242.208 306.805 231.565 296.402 223.12 287.964C209.161 274.019 204.122 268.834 194.18 258.185L190.87 254.64L194.459 250.815C213.053 231.001 230.406 213.631 250.883 194.337C255.76 189.741 254.161 189.31 263.07 197.617ZM168.102 229.059C173.294 235.101 181.87 244.793 187.318 250.775C191.249 255.092 191.082 254.456 188.902 256.795C183.977 262.084 170.908 276.864 165.479 283.288C162.92 286.315 163.144 286.256 161.145 284.425C152.644 276.629 140.691 266.041 132.459 259.011C126.654 254.054 126.402 255.482 134.271 248.748C141.427 242.623 153.553 231.868 159.155 226.676C163.449 222.696 162.391 222.415 168.102 229.059ZM350.975 226.386C356.648 231.614 368.764 242.357 375.874 248.465C379.679 251.732 382.752 254.558 382.705 254.745C382.658 254.931 379.42 257.83 375.51 261.187C368.027 267.611 359.316 275.321 352.09 281.918C346.834 286.717 348.198 287.035 341.728 279.506C335.885 272.708 328.745 264.648 323.171 258.556C321.284 256.494 319.773 254.713 319.813 254.6C319.854 254.487 322.477 251.533 325.641 248.035C331.996 241.012 340.548 231.282 344.566 226.506C347.695 222.785 347.08 222.797 350.975 226.386Z",
    fill: "white"
  })]
});
function Br({
  symbol: e2,
  size: n2
}) {
  switch (e2) {
    case "apt":
      return /* @__PURE__ */ s$1(Vr, {
        size: n2
      });
    case "btc":
      return /* @__PURE__ */ s$1(Nr, {
        size: n2
      });
    case "eth":
      return /* @__PURE__ */ s$1(Jr, {
        size: n2
      });
    case "sol":
      return /* @__PURE__ */ s$1(Ar, {
        size: n2
      });
    case "usdt":
      return /* @__PURE__ */ s$1(Dr, {
        size: n2
      });
    case "usdc":
      return /* @__PURE__ */ s$1(Mr, {
        size: n2
      });
    case "aux":
      return /* @__PURE__ */ s$1(Lr, {
        size: n2
      });
    case "martian":
      return /* @__PURE__ */ s$1(Fr, {
        size: n2
      });
    case "martian":
      return /* @__PURE__ */ s$1(Sr, {
        size: n2
      });
    default:
      return null;
  }
}
function Gr({
  coin: e2,
  size: n2
}) {
  return e2 ? /* @__PURE__ */ s$1(Br, {
    symbol: e2 == null ? void 0 : e2.toLowerCase(),
    size: n2 != null ? n2 : 32
  }) : null;
}
function xn({
  coins: e2,
  size: n2 = 32
}) {
  return /* @__PURE__ */ s$1("div", {
    className: "flex items-center -space-x-2",
    children: e2.map((i2, r) => /* @__PURE__ */ s$1("div", {
      className: "inline-block rounded-full drop-shadow-lg ring-2 ring-primary-200",
      children: /* @__PURE__ */ s$1(Gr, {
        coin: i2,
        size: n2
      }, `avatar-${i2}-${r}`)
    }))
  });
}
function wn({
  children: e2,
  className: n2,
  variant: i2,
  size: r,
  onClick: o2
}) {
  const l = () => {
    switch (i2) {
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
    const f = "font-semibold rounded shadow-sm", m = c(), v = l();
    return `${f} ${m} ${v} ${n2 != null ? n2 : ""}`;
  })();
  return /* @__PURE__ */ s$1("span", {
    onClick: o2,
    className: d,
    children: e2
  });
}
function Hr({
  valueChange: e2,
  percentChange: n2,
  priceDirection: i2
}) {
  const o2 = (() => {
    const l = "inline-flex items-center font-bold text-xs";
    return i2 && i2 === "up" ? `${l} text-green-400` : i2 && i2 === "down" ? `${l} text-red-400` : `${l} text-primary-400`;
  })();
  return /* @__PURE__ */ C("div", {
    className: o2,
    children: [i2 && i2 === "up" ? /* @__PURE__ */ s$1(hr, {
      className: "w-[14px] h-[14px] mr-1"
    }) : i2 && i2 === "down" ? /* @__PURE__ */ s$1(cr, {
      className: "w-[14px] h-[14px] mr-1"
    }) : null, n2 && /* @__PURE__ */ C("div", {
      className: "mr-2",
      children: [n2, "%"]
    }), e2 && /* @__PURE__ */ s$1("div", {
      children: e2
    })]
  });
}
function bn({
  title: e2,
  value: n2,
  valueChange: i2,
  percentChange: r,
  priceDirection: o2,
  variant: l,
  className: c,
  onClick: h
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
    const v = "p-3 rounded-lg", y = d();
    return `${v} ${y} ${c != null ? c : ""}`;
  })();
  return /* @__PURE__ */ C("div", {
    className: m,
    onClick: h,
    children: [/* @__PURE__ */ s$1(oe, {
      children: e2
    }), /* @__PURE__ */ s$1("div", {
      className: "text-2xl",
      children: n2
    }), r || i2 ? /* @__PURE__ */ s$1(Hr, {
      percentChange: r,
      valueChange: i2,
      priceDirection: o2
    }) : null]
  });
}
function Qr(...e2) {
  return e2.filter(Boolean).join(" ");
}
function Rn({
  options: e2,
  onChange: n2,
  label: i2,
  value: r,
  className: o2
}) {
  const [l, c] = react.exports.useState(r), h = react.exports.useCallback((d) => {
    n2 == null || n2(d.value), c(d);
  }, [n2]);
  return /* @__PURE__ */ s$1(pt, {
    value: l,
    onChange: h,
    children: ({
      open: d
    }) => /* @__PURE__ */ s$1($e, {
      children: /* @__PURE__ */ C("div", {
        className: `relative mt-1 w-56 ${o2}`,
        children: [/* @__PURE__ */ s$1(oe, {
          className: "block",
          children: i2
        }), /* @__PURE__ */ C(pt.Button, {
          className: " text-white relative w-full h-[46px] cursor-default rounded-md bg-primary-800 py-2 pl-3 pr-10 text-left truncate outline-none border border-transparent focus:border-brand focus-visible:border-brand hover:cursor-pointer sm:text-sm",
          children: [l.label, /* @__PURE__ */ s$1("span", {
            className: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3",
            children: d ? /* @__PURE__ */ s$1(xr, {
              className: "h-4 w-4 text-primary-400",
              "aria-hidden": "true"
            }) : /* @__PURE__ */ s$1(vr, {
              className: "h-4 w-4 text-primary-400",
              "aria-hidden": "true"
            })
          })]
        }), /* @__PURE__ */ s$1(pt.Options, {
          className: " absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-primary-700 py-1 text-white shadow-lg ring-1 border-none ring-black ring-opacity-5 outline-none sm:text-sm ",
          children: e2.map((f) => /* @__PURE__ */ s$1(pt.Option, {
            value: f,
            className: ({
              active: m
            }) => Qr(m ? "text-white bg-secondary-600" : "text-white", "relative cursor-pointer select-none py-2 pl-3 pr-9"),
            children: f.label
          }, f.label))
        })]
      })
    })
  });
}
function On({
  value: e2,
  onChange: n2,
  name: i2,
  placeholder: r = "0.00",
  label: o2,
  prefix: l,
  suffix: c,
  className: h,
  inputClass: d,
  autoFocus: f = false
}) {
  const v = (() => `bg-primary-800 p-3 block w-full rounded-md outline-none border border-transparent focus:border-brand focus-visible:border-brand sm:text-sm ${l ? "pl-7" : ""} ${c ? "pr-12" : ""} ${d}`)();
  return /* @__PURE__ */ C("div", {
    className: h,
    children: [o2 && /* @__PURE__ */ s$1(oe, {
      htmlFor: i2,
      children: o2
    }), /* @__PURE__ */ C("div", {
      className: "relative rounded-md shadow-sm ",
      children: [/* @__PURE__ */ s$1("div", {
        className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
        children: l
      }), /* @__PURE__ */ s$1("input", {
        autoFocus: f,
        type: "text",
        name: i2,
        id: i2,
        value: e2,
        placeholder: r,
        onChange: n2,
        className: v
      }), /* @__PURE__ */ s$1("div", {
        className: "absolute inset-y-0 right-3 flex items-center text-gray-300",
        children: c
      })]
    })]
  });
}
function kn({
  enabled: e2,
  onChange: n2
}) {
  return /* @__PURE__ */ s$1(be, {
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
    children: /* @__PURE__ */ s$1("span", {
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
function In({
  tabs: e2
}) {
  const n2 = (r) => r === "buy" ? "border-b-green-500 text-green-400" : r === "sell" ? "border-b-red-500 text-red-400" : "border-b-secondary-500 text-secondary-400", i2 = (r, o2) => {
    const l = "w-full py-2.5 text-sm font-semibold leading-5 border-b-2 border-primary-700 outline-none";
    if (r) {
      const c = n2(o2);
      return `${l} ${c}`;
    } else
      return `${l} text-primary-300 hover:bg-white/[0.05]`;
  };
  return /* @__PURE__ */ s$1(Ge.List, {
    className: "flex",
    children: e2.map((r) => /* @__PURE__ */ s$1(Ge, {
      className: ({
        selected: o2
      }) => i2(o2, r.variant),
      onClick: r.onClick,
      children: r.label
    }, r.label))
  });
}
function Un({
  max: e2,
  min: n2,
  value: i2,
  onChange: r
}) {
  return /* @__PURE__ */ s$1("div", {
    className: "Slider-root",
    children: /* @__PURE__ */ s$1(Slider, {
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
      value: i2,
      max: e2,
      min: n2,
      onChange: r
    })
  });
}
const jn = ({
  children: e2,
  className: n2,
  id: i2,
  padding: r,
  onClick: o2
}) => /* @__PURE__ */ s$1("div", {
  onClick: o2,
  id: i2,
  className: `rounded-2xl bg-primary-900 p-${r != null ? r : 6} shadow-md ${n2 != null ? n2 : ""}`,
  children: e2
});
const Yn = react.exports.forwardRef(function({
  children: n2,
  trigger: i2
}, r) {
  const [o2, l] = react.exports.useState(false), c = react.exports.useRef(null);
  return react.exports.useImperativeHandle(r, () => ({
    isOpen: o2,
    openModal() {
      l(true);
    },
    closeModal() {
      l(false);
    }
  }), [o2]), /* @__PURE__ */ C($e, {
    children: [i2 ? /* @__PURE__ */ s$1("div", {
      onClick: () => l(true),
      children: i2
    }) : null, /* @__PURE__ */ s$1(We.Root, {
      show: o2,
      as: react.exports.Fragment,
      children: /* @__PURE__ */ C(gt, {
        as: "div",
        className: "relative z-10",
        initialFocus: c,
        onClose: l,
        children: [/* @__PURE__ */ s$1(We.Child, {
          as: react.exports.Fragment,
          enter: "ease-out duration-300",
          enterFrom: "opacity-0",
          enterTo: "opacity-100",
          leave: "ease-in duration-200",
          leaveFrom: "opacity-100",
          leaveTo: "opacity-0",
          children: /* @__PURE__ */ s$1("div", {
            className: "fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          })
        }), /* @__PURE__ */ s$1("div", {
          className: "fixed inset-0 z-10 overflow-y-auto",
          children: /* @__PURE__ */ s$1("div", {
            className: "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0",
            children: /* @__PURE__ */ s$1(We.Child, {
              as: react.exports.Fragment,
              enter: "ease-out duration-300",
              enterFrom: "opacity-0 tranprimary-y-4 sm:tranprimary-y-0 sm:scale-95",
              enterTo: "opacity-100 tranprimary-y-0 sm:scale-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100 tranprimary-y-0 sm:scale-100",
              leaveTo: "opacity-0 tranprimary-y-4 sm:tranprimary-y-0 sm:scale-95",
              children: /* @__PURE__ */ s$1(gt.Panel, {
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
function ee(e2, n2, i2) {
  let r = [], o2;
  return () => {
    let l;
    i2.key && i2.debug != null && i2.debug() && (l = Date.now());
    const c = e2();
    if (!(c.length !== r.length || c.some((f, m) => r[m] !== f)))
      return o2;
    r = c;
    let d;
    if (i2.key && i2.debug != null && i2.debug() && (d = Date.now()), o2 = n2(...c), i2 == null || i2.onChange == null || i2.onChange(o2), i2.key && i2.debug != null && i2.debug()) {
      const f = Math.round((Date.now() - l) * 100) / 100, m = Math.round((Date.now() - d) * 100) / 100, v = m / 16, y = (x, R) => {
        for (x = String(x); x.length < R; )
          x = " " + x;
        return x;
      };
      console.info("%c\u23F1 " + y(m, 5) + " /" + y(f, 5) + " ms", `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(` + Math.max(0, Math.min(120 - 120 * v, 120)) + "deg 100% 31%);", i2 == null ? void 0 : i2.key);
    }
    return o2;
  };
}
const Tr = (e2) => e2, Zr = (e2) => {
  const n2 = Math.max(e2.startIndex - e2.overscan, 0), i2 = Math.min(e2.endIndex + e2.overscan, e2.count - 1), r = [];
  for (let o2 = n2; o2 <= i2; o2++)
    r.push(o2);
  return r;
}, Pr = (e2, n2) => {
  const i2 = new ResizeObserver((r) => {
    var o2, l;
    n2({
      width: (o2 = r[0]) == null ? void 0 : o2.contentRect.width,
      height: (l = r[0]) == null ? void 0 : l.contentRect.height
    });
  });
  if (!!e2.scrollElement)
    return n2(e2.scrollElement.getBoundingClientRect()), i2.observe(e2.scrollElement), () => {
      i2.unobserve(e2.scrollElement);
    };
}, Ke = {
  element: ["scrollLeft", "scrollTop"],
  window: ["scrollX", "scrollY"]
}, Kr = (e2) => (n2, i2) => {
  if (!n2.scrollElement)
    return;
  const r = Ke[e2][0], o2 = Ke[e2][1];
  let l = n2.scrollElement[r], c = n2.scrollElement[o2];
  const h = () => {
    i2(n2.scrollElement[n2.options.horizontal ? r : o2]);
  };
  h();
  const d = (f) => {
    const m = f.currentTarget, v = m[r], y = m[o2];
    (n2.options.horizontal ? l - v : c - y) && h(), l = v, c = y;
  };
  return n2.scrollElement.addEventListener("scroll", d, {
    capture: false,
    passive: true
  }), () => {
    n2.scrollElement.removeEventListener("scroll", d);
  };
}, qr = Kr("element"), Wr = (e2, n2) => e2.getBoundingClientRect()[n2.options.horizontal ? "width" : "height"], Xr = (e2, n2, i2) => {
  var r;
  (r = i2.scrollElement) == null || r.scrollTo == null || r.scrollTo({
    [i2.options.horizontal ? "left" : "top"]: e2,
    behavior: n2 ? "smooth" : void 0
  });
};
class _r {
  constructor(n2) {
    var i2 = this;
    this.unsubs = [], this.scrollElement = null, this.measurementsCache = [], this.itemMeasurementsCache = {}, this.pendingMeasuredCacheIndexes = [], this.measureElementCache = {}, this.range = {
      startIndex: 0,
      endIndex: 0
    }, this.setOptions = (r) => {
      Object.entries(r).forEach((o2) => {
        let [l, c] = o2;
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
        getItemKey: Tr,
        rangeExtractor: Zr,
        enableSmoothScroll: true,
        onChange: () => {
        },
        measureElement: Wr,
        initialRect: {
          width: 0,
          height: 0
        },
        ...r
      };
    }, this.notify = () => {
      var r, o2;
      (r = (o2 = this.options).onChange) == null || r.call(o2, this);
    }, this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((r) => r()), this.unsubs = [], this.scrollElement = null;
    }, this._didMount = () => () => {
      this.cleanup();
    }, this._willUpdate = () => {
      const r = this.options.getScrollElement();
      this.scrollElement !== r && (this.cleanup(), this.scrollElement = r, this._scrollToOffset(this.scrollOffset, false), this.unsubs.push(this.options.observeElementRect(this, (o2) => {
        this.scrollRect = o2, this.calculateRange();
      })), this.unsubs.push(this.options.observeElementOffset(this, (o2) => {
        this.scrollOffset = o2, this.calculateRange();
      })));
    }, this.getSize = () => this.scrollRect[this.options.horizontal ? "width" : "height"], this.getMeasurements = ee(() => [this.options.count, this.options.paddingStart, this.options.getItemKey, this.itemMeasurementsCache], (r, o2, l, c) => {
      const h = this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
      this.pendingMeasuredCacheIndexes = [];
      const d = this.measurementsCache.slice(0, h);
      for (let f = h; f < r; f++) {
        const m = l(f), v = c[m], y = d[f - 1] ? d[f - 1].end : o2, x = typeof v == "number" ? v : this.options.estimateSize(f), R = y + x;
        d[f] = {
          index: f,
          start: y,
          size: x,
          end: R,
          key: m
        };
      }
      return this.measurementsCache = d, d;
    }, {
      key: false,
      debug: () => this.options.debug
    }), this.calculateRange = ee(() => [this.getMeasurements(), this.getSize(), this.scrollOffset], (r, o2, l) => {
      const c = en({
        measurements: r,
        outerSize: o2,
        scrollOffset: l
      });
      return (c.startIndex !== this.range.startIndex || c.endIndex !== this.range.endIndex) && (this.range = c, this.notify()), this.range;
    }, {
      key: false,
      debug: () => this.options.debug
    }), this.getIndexes = ee(() => [this.options.rangeExtractor, this.range, this.options.overscan, this.options.count], (r, o2, l, c) => r({
      ...o2,
      overscan: l,
      count: c
    }), {
      key: false,
      debug: () => this.options.debug
    }), this.getVirtualItems = ee(() => [this.getIndexes(), this.getMeasurements(), this.options.measureElement], (r, o2, l) => {
      const c = (m) => (v) => {
        var y;
        const x = this.measurementsCache[m];
        if (!v)
          return;
        const R = l(v, this), U = (y = this.itemMeasurementsCache[x.key]) != null ? y : x.size;
        R !== U && (x.start < this.scrollOffset && (this.destinationOffset || this._scrollToOffset(this.scrollOffset + (R - U), false)), this.pendingMeasuredCacheIndexes.push(m), this.itemMeasurementsCache = {
          ...this.itemMeasurementsCache,
          [x.key]: R
        }, this.notify());
      }, h = [], d = {};
      for (let m = 0, v = r.length; m < v; m++) {
        var f;
        const y = r[m], R = {
          ...o2[y],
          measureElement: d[y] = (f = this.measureElementCache[y]) != null ? f : c(y)
        };
        h.push(R);
      }
      return this.measureElementCache = d, h;
    }, {
      key: false,
      debug: () => this.options.debug
    }), this.scrollToOffset = function(r, o2) {
      let {
        align: l = "start",
        smoothScroll: c = i2.options.enableSmoothScroll
      } = o2 === void 0 ? {} : o2;
      const h = i2.scrollOffset, d = i2.getSize();
      l === "auto" && (r <= h ? l = "start" : r >= h + d ? l = "end" : l = "start"), l === "start" ? i2._scrollToOffset(r, c) : l === "end" ? i2._scrollToOffset(r - d, c) : l === "center" && i2._scrollToOffset(r - d / 2, c);
    }, this.scrollToIndex = function(r, o2) {
      let {
        align: l = "auto",
        smoothScroll: c = i2.options.enableSmoothScroll,
        ...h
      } = o2 === void 0 ? {} : o2;
      const d = i2.getMeasurements(), f = i2.scrollOffset, m = i2.getSize(), {
        count: v
      } = i2.options, y = d[Math.max(0, Math.min(r, v - 1))];
      if (!y)
        return;
      if (l === "auto")
        if (y.end >= f + m - i2.options.scrollPaddingEnd)
          l = "end";
        else if (y.start <= f + i2.options.scrollPaddingStart)
          l = "start";
        else
          return;
      const x = l === "end" ? y.end + i2.options.scrollPaddingEnd : y.start - i2.options.scrollPaddingStart;
      i2.scrollToOffset(x, {
        align: l,
        smoothScroll: c,
        ...h
      });
    }, this.getTotalSize = () => {
      var r;
      return (((r = this.getMeasurements()[this.options.count - 1]) == null ? void 0 : r.end) || this.options.paddingStart) + this.options.paddingEnd;
    }, this._scrollToOffset = (r, o2) => {
      clearTimeout(this.scrollCheckFrame), this.destinationOffset = r, this.options.scrollToFn(r, o2, this);
      let l;
      const c = () => {
        let h = this.scrollOffset;
        this.scrollCheckFrame = l = setTimeout(() => {
          if (this.scrollCheckFrame === l) {
            if (this.scrollOffset === h) {
              this.destinationOffset = void 0;
              return;
            }
            h = this.scrollOffset, c();
          }
        }, 100);
      };
      c();
    }, this.measure = () => {
      this.itemMeasurementsCache = {}, this.notify();
    }, this.setOptions(n2), this.scrollRect = this.options.initialRect, this.scrollOffset = this.options.initialOffset, this.calculateRange();
  }
}
const $r = (e2, n2, i2, r) => {
  for (; e2 <= n2; ) {
    const o2 = (e2 + n2) / 2 | 0, l = i2(o2);
    if (l < r)
      e2 = o2 + 1;
    else if (l > r)
      n2 = o2 - 1;
    else
      return o2;
  }
  return e2 > 0 ? e2 - 1 : 0;
};
function en(e2) {
  let {
    measurements: n2,
    outerSize: i2,
    scrollOffset: r
  } = e2;
  const o2 = n2.length - 1, c = $r(0, o2, (d) => n2[d].start, r);
  let h = c;
  for (; h < o2 && n2[h].end < r + i2; )
    h++;
  return {
    startIndex: c,
    endIndex: h
  };
}
const tn = typeof window < "u" ? react.exports.useLayoutEffect : react.exports.useEffect;
function rn(e2) {
  const n2 = react.exports.useReducer(() => ({}), {})[1], i2 = {
    ...e2,
    onChange: (o2) => {
      n2(), e2.onChange == null || e2.onChange(o2);
    }
  }, [r] = react.exports.useState(() => new _r(i2));
  return r.setOptions(i2), react.exports.useEffect(() => r._didMount(), []), tn(() => r._willUpdate()), r;
}
function nn(e2) {
  return rn({
    observeElementRect: Pr,
    observeElementOffset: qr,
    scrollToFn: Xr,
    ...e2
  });
}
function on({
  title: e2,
  titleId: n2,
  ...i2
}, r) {
  return /* @__PURE__ */ C("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, i2),
    children: [e2 ? /* @__PURE__ */ s$1("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ s$1("path", {
      fillRule: "evenodd",
      d: "M12 2.25a.75.75 0 01.75.75v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06l6.22 6.22V3a.75.75 0 01.75-.75z",
      clipRule: "evenodd"
    })]
  });
}
const sn = react.exports.forwardRef(on), an = sn;
function ln({
  title: e2,
  titleId: n2,
  ...i2
}, r) {
  return /* @__PURE__ */ C("svg", {
    ...Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      ref: r,
      "aria-labelledby": n2
    }, i2),
    children: [e2 ? /* @__PURE__ */ s$1("title", {
      id: n2,
      children: e2
    }) : null, /* @__PURE__ */ s$1("path", {
      fillRule: "evenodd",
      d: "M11.47 2.47a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06l-6.22-6.22V21a.75.75 0 01-1.5 0V4.81l-6.22 6.22a.75.75 0 11-1.06-1.06l7.5-7.5z",
      clipRule: "evenodd"
    })]
  });
}
const cn = react.exports.forwardRef(ln), un = cn;
function Vn({
  data: e2,
  columns: n2,
  customRowRender: i2,
  virtualizeOptions: r,
  className: o2
}) {
  const [l, c] = react.exports.useState([]), h = useReactTable({
    columns: n2,
    data: e2,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: c,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: l
    }
  }), d = react.exports.useRef(null), {
    rows: f
  } = h.getRowModel(), m = nn(r != null ? r : {
    getScrollElement: () => d.current,
    count: f.length,
    estimateSize: () => f.length,
    overscan: 10
  }), {
    getVirtualItems: v,
    getTotalSize: y
  } = m, x = v();
  return y(), /* @__PURE__ */ C("table", {
    className: `border-collapse table-auto max-w-full w-full text-sm capitalize relative ${o2}`,
    ref: d,
    children: [/* @__PURE__ */ s$1("thead", {
      children: h.getHeaderGroups().map((R) => /* @__PURE__ */ s$1("tr", {
        children: R.headers.map((U) => /* @__PURE__ */ s$1("th", {
          onClick: U.column.getToggleSortingHandler(),
          className: "border-b dark:border-primary-600 font-medium p-2 pl-4 pt-0 pb-3 text-primary-400 dark:text-primary-200 text-left",
          children: /* @__PURE__ */ C(oe, {
            children: [flexRender(U.column.columnDef.header, U.getContext()), U.column.getIsSorted() ? U.column.getIsSorted() === "desc" ? /* @__PURE__ */ s$1("span", {
              className: "w-3 h-3 ml-3 text-brand inline-block",
              children: /* @__PURE__ */ s$1(an, {})
            }) : /* @__PURE__ */ s$1("span", {
              className: "w-3 h-3 ml-3 text-brand inline-block",
              children: /* @__PURE__ */ s$1(un, {})
            }) : null]
          })
        }, U.id))
      }, R.id))
    }), /* @__PURE__ */ s$1("tbody", {
      children: x.map((R) => {
        var Z;
        const U = f[R.index];
        return (Z = i2 == null ? void 0 : i2(U)) != null ? Z : /* @__PURE__ */ s$1("tr", {
          children: U.getVisibleCells().map((J) => /* @__PURE__ */ s$1("td", {
            className: "border-b border-primary-100 dark:border-primary-700 p-2 pl-4 text-primary-500 dark:text-primary-200 text-left",
            children: flexRender(J.column.columnDef.cell, J.getContext())
          }, J.id))
        }, U.id);
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
  const suggestedBadge = /* @__PURE__ */ jsx(wn, {
    size: "xs",
    children: "Recommended"
  });
  const connectedBadge = /* @__PURE__ */ jsx(wn, {
    size: "xs",
    variant: "success",
    children: "Connected"
  });
  const detectedBadge = /* @__PURE__ */ jsx(wn, {
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
    const result = _options.sort((a, b) => {
      if (a.connected)
        return -1;
      if (a.suggested)
        return 1;
      if (a.detected)
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
          return /* @__PURE__ */ jsxs(Pe, {
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
    children: /* @__PURE__ */ jsx(Yn, {
      trigger: renderTrigger(trigger, activeWallet == null ? void 0 : activeWallet.walletType, connection == null ? void 0 : connection.address),
      ref,
      children: /* @__PURE__ */ jsxs(jn, {
        className: "h-[400px] bg-primary-800 border border-primary-700",
        children: [/* @__PURE__ */ jsx("div", {
          className: "pb-3 text-xl bg-stripes-secondary",
          children: "Select Wallet"
        }), options.map((wallet) => /* @__PURE__ */ jsx("div", {
          onClick: wallet.onClick,
          className: `rounded-lg p-4 hover:bg-secondary-800 hover:cursor-pointer ${wallet.suggested && "bg-brand-purple/60"}`,
          children: /* @__PURE__ */ jsxs("div", {
            className: "flex items-center",
            children: [/* @__PURE__ */ jsx(Gr, {
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
      children: [/* @__PURE__ */ jsx(xn, {
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
  var _a, _b, _c, _d, _e2, _f, _g, _h, _i;
  const {
    params,
    setParams
  } = vn();
  const coinsQuery = usePoolCoins();
  const coins = (_b = (_a = coinsQuery.data) == null ? void 0 : _a.poolCoins) != null ? _b : [];
  const defaultCoinX = (_c = coins.find(({
    coinType
  }) => coinType.toLowerCase().match("btc"))) == null ? void 0 : _c.coinType;
  const defaultCoinY = (_d = coins.find(({
    coinType
  }) => coinType.toLowerCase().match("usd"))) == null ? void 0 : _d.coinType;
  const coinx = (_e2 = params.get("coinx")) != null ? _e2 : defaultCoinX;
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
    children: /* @__PURE__ */ jsx(mt, {
      className: "relative",
      ref: popoverRef,
      children: ({
        open,
        close
      }) => {
        var _a2, _b, _c, _d, _e2;
        return /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx(oe, {
            children: "Select Market"
          }), /* @__PURE__ */ jsxs(mt.Button, {
            className: `${open ? "" : "hover:bg-primary-700"} ${baseButtonClasses}`,
            children: [/* @__PURE__ */ jsx(xn, {
              coins: [firstCoin == null ? void 0 : firstCoin.symbol, secondCoin == null ? void 0 : secondCoin.symbol],
              size: 32
            }), /* @__PURE__ */ jsx("div", {
              className: "text-xl ml-3 mr-auto text-left",
              children: (_e2 = `${(_b = (_a2 = selectedMarket == null ? void 0 : selectedMarket.baseCoinInfo) == null ? void 0 : _a2.symbol) != null ? _b : "..."}/${(_d = (_c = selectedMarket == null ? void 0 : selectedMarket.quoteCoinInfo) == null ? void 0 : _c.symbol) != null ? _d : "..."}`) != null ? _e2 : null
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
                    children: /* @__PURE__ */ jsx(On, {
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
    children: /* @__PURE__ */ jsxs(jn, {
      className: "max-w-[960px] w-full max-h-full overflow-auto px-0",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex justify-between mb-4 px-6",
        children: [/* @__PURE__ */ jsx(En, {
          children: "Transactions"
        }), /* @__PURE__ */ jsx("div", {
          className: "flex gap-2 mb-4",
          children: actionButtonProps.map((props) => /* @__PURE__ */ jsx(Pe, {
            onClick: props.onClick,
            size: "sm",
            variant: "basic",
            children: props.children
          }, props.children))
        })]
      }), /* @__PURE__ */ jsx(Vn, {
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
    var _a2, _b2, _c2, _d2, _e2, _f;
    return {
      lpCoinType: (_a2 = pool == null ? void 0 : pool.coinInfoLP.coinType) != null ? _a2 : "",
      amountIn: amountAddedX,
      amountOut: amountAddedY,
      time: (_b2 = DateTime.fromJSDate(randRecentDate()).toRelative()) != null ? _b2 : "-",
      totalValue: amountMintedLP != null ? amountMintedLP : "-",
      symbolIn: (_c2 = pool == null ? void 0 : pool.coinInfoX.symbol) != null ? _c2 : "-",
      symbolOut: (_d2 = pool == null ? void 0 : pool.coinInfoY.symbol) != null ? _d2 : "-",
      type: `Add ${(_e2 = pool == null ? void 0 : pool.coinInfoX.symbol) != null ? _e2 : ""} and ${(_f = pool == null ? void 0 : pool.coinInfoY.symbol) != null ? _f : ""}`
    };
  });
  const removeLiquidityTableData = ((_d = pool == null ? void 0 : pool.removeLiquidityHistory) != null ? _d : []).map(({
    amountBurnedLP,
    amountRemovedX,
    amountRemovedY
  }) => {
    var _a2, _b2, _c2, _d2, _e2, _f;
    return {
      lpCoinType: (_a2 = pool == null ? void 0 : pool.coinInfoLP.coinType) != null ? _a2 : "",
      amountIn: amountRemovedX,
      amountOut: amountRemovedY,
      time: (_b2 = DateTime.fromJSDate(randRecentDate()).toRelative()) != null ? _b2 : "-",
      totalValue: amountBurnedLP != null ? amountBurnedLP : "-",
      symbolIn: (_c2 = pool == null ? void 0 : pool.coinInfoX.symbol) != null ? _c2 : "-",
      symbolOut: (_d2 = pool == null ? void 0 : pool.coinInfoY.symbol) != null ? _d2 : "-",
      type: `Remove ${(_e2 = pool == null ? void 0 : pool.coinInfoX.symbol) != null ? _e2 : ""} and ${(_f = pool == null ? void 0 : pool.coinInfoY.symbol) != null ? _f : ""}`
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
        accessorKey: "amountAuIn",
        header: "Token In (Au)",
        cell(c) {
          const value = c.getValue();
          return `${value} ${pool == null ? void 0 : pool.coinInfoX.symbol}`;
        }
      },
      {
        accessorKey: "amountAuOut",
        header: "Token Out (Au)",
        cell(c) {
          const value = c.getValue();
          return `${value} ${pool == null ? void 0 : pool.coinInfoY.symbol}`;
        }
      },
      {
        accessorKey: "time",
        header: "Time"
      }
    ]
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
    children: [/* @__PURE__ */ jsx(Gr, {
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
  return /* @__PURE__ */ jsx(Yn, {
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
  return /* @__PURE__ */ jsxs(jn, {
    className: "bg-primary-700 min-w-[400px] min-h-[200px]",
    children: [/* @__PURE__ */ jsx(En, {
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
      children: [coin ? /* @__PURE__ */ jsx(Gr, {
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
  return /* @__PURE__ */ jsxs(jn, {
    className: "w-[700px] mx-auto self-center",
    children: [/* @__PURE__ */ jsx(En, {
      className: "mb-4",
      children: "Add Liquidity"
    }), /* @__PURE__ */ jsx(oe, {
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
    }), /* @__PURE__ */ jsx(Pe, {
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
  return !firstCoin && !secondCoin ? /* @__PURE__ */ jsxs(jn, {
    className: "flex flex-col gap-8 w-[700px] mx-auto self-center",
    children: [notFoundMsg, /* @__PURE__ */ jsx(Pe, {
      onClick: goBackToPools,
      children: "Back to pools"
    })]
  }) : /* @__PURE__ */ jsxs(jn, {
    className: "flex flex-col gap-8 w-[700px] mx-auto self-center",
    children: [/* @__PURE__ */ jsxs(jn, {
      className: "p-8 text-white flex flex-col gap-8",
      children: ["Remove Liquidity", /* @__PURE__ */ jsx(Un, {
        value: pctVal,
        onChange: setPctVal,
        min: 0,
        max: 100
      }), /* @__PURE__ */ jsx("span", {
        className: "text-6xl text-white font-bold",
        children: `${pctVal}%`
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex w-full justify-evenly",
        children: [/* @__PURE__ */ jsx(Pe, {
          onClick: () => setPctVal(25),
          children: "25%"
        }), /* @__PURE__ */ jsx(Pe, {
          onClick: () => setPctVal(50),
          children: "50%"
        }), /* @__PURE__ */ jsx(Pe, {
          onClick: () => setPctVal(75),
          children: "75%"
        }), /* @__PURE__ */ jsx(Pe, {
          onClick: () => setPctVal(100),
          children: "Max"
        })]
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "w-full flex justify-center",
      children: /* @__PURE__ */ jsx(ArrowDownIcon, {
        className: "w-8 text-white"
      })
    }), /* @__PURE__ */ jsxs(jn, {
      className: "flex flex-col gap-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex justify-between text-white",
        children: [/* @__PURE__ */ jsx("div", {
          children: firstCoinAmount
        }), /* @__PURE__ */ jsx("div", {
          className: "flex gap-4 justify-end",
          children: (firstCoin == null ? void 0 : firstCoin.symbol) ? /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsx(Gr, {
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
            children: [/* @__PURE__ */ jsx(Gr, {
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
      children: [/* @__PURE__ */ jsx(Pe, {
        onClick: handleRemoveLiquidity,
        children: "Confirm"
      }), /* @__PURE__ */ jsx(Pe, {
        onClick: goBackToPools,
        children: "Cancel"
      })]
    })]
  });
}
function RemoveLiquidityContainer({}) {
  var _a, _b, _c, _d, _e2, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r2, _s, _t2, _u, _v, _w, _x;
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
    baseCoinType: (_e2 = (_d = (_c = poolQuery.data) == null ? void 0 : _c.pool) == null ? void 0 : _d.coinInfoX.coinType) != null ? _e2 : "",
    quoteCoinType: (_h = (_g = (_f = poolQuery.data) == null ? void 0 : _f.pool) == null ? void 0 : _g.coinInfoY.coinType) != null ? _h : ""
  }]);
  const secondCoinRelativePriceQuery = useLastTradePrice([{
    baseCoinType: (_k = (_j = (_i = poolQuery.data) == null ? void 0 : _i.pool) == null ? void 0 : _j.coinInfoY.coinType) != null ? _k : "",
    quoteCoinType: (_n = (_m = (_l = poolQuery.data) == null ? void 0 : _l.pool) == null ? void 0 : _m.coinInfoX.coinType) != null ? _n : ""
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
    secondCoinRelativePrice: (_u = (_t2 = secondCoinRelativePriceQuery.data) == null ? void 0 : _t2.lastTradePrice) != null ? _u : 0,
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
        children: pool && /* @__PURE__ */ jsx(xn, {
          coins: [pool == null ? void 0 : pool.coinInfoX.symbol, pool == null ? void 0 : pool.coinInfoY.symbol],
          size: 48
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "self-center ml-4 text-4xl",
        children: `${pool == null ? void 0 : pool.coinInfoX.name} / ${pool == null ? void 0 : pool.coinInfoY.name}`
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex",
      children: [/* @__PURE__ */ jsx(bn, {
        title: `${pool == null ? void 0 : pool.coinInfoX.name} Locked`,
        value: (_a = pool == null ? void 0 : pool.amountX) != null ? _a : "-"
      }), /* @__PURE__ */ jsx(bn, {
        title: `${pool == null ? void 0 : pool.coinInfoY.name} Locked`,
        value: (_b = pool == null ? void 0 : pool.amountY) != null ? _b : "-"
      }), /* @__PURE__ */ jsx(bn, {
        title: "Fee Percent",
        value: (pool == null ? void 0 : pool.feePercent) ? `${pool.feePercent}%` : "-"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex gap-4 mt-6",
      children: [/* @__PURE__ */ jsx(Pe, {
        onClick: () => setAddOpen(true),
        variant: "buy",
        size: "sm",
        children: "Adds"
      }), /* @__PURE__ */ jsx(Pe, {
        onClick: () => setRemoveOpen(true),
        variant: "sell",
        size: "sm",
        children: "Removes"
      })]
    }), /* @__PURE__ */ jsx(PoolsEventTableContainer, {}), /* @__PURE__ */ jsx(We, {
      appear: true,
      show: isAddOpen,
      as: react.exports.Fragment,
      children: /* @__PURE__ */ jsxs(gt, {
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
              children: /* @__PURE__ */ jsx(gt.Panel, {
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
      children: /* @__PURE__ */ jsxs(gt, {
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
function PortfolioView({
  positions
}) {
  var _a, _b, _c, _d, _e2, _f, _g, _h, _i, _j;
  const [wallet, , connection] = useWallet();
  const query = useQuery(PortfolioDocument, {
    variables: {
      owner: connection == null ? void 0 : connection.address
    }
  });
  const marketCoins = useMarketCoins();
  const getMarketNameByType = (a, b) => {
    const aCoin = marketCoins == null ? void 0 : marketCoins.find((m) => m.coinType === a);
    const bCoin = marketCoins == null ? void 0 : marketCoins.find((m) => m.coinType === b);
    return `${aCoin == null ? void 0 : aCoin.symbol}/${bCoin == null ? void 0 : bCoin.symbol}`;
  };
  react.exports.useEffect(() => {
    console.log(query.loading);
  }, [query.loading]);
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
      return /* @__PURE__ */ jsx(wn, {
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
    market: getMarketNameByType(baseCoinType, quoteCoinType),
    price,
    date: new Date(time).toString(),
    quantity,
    kind: orderType
  }))) != null ? _c : [];
  const orderHistoryData = (_f = (_e2 = (_d = query.data) == null ? void 0 : _d.account) == null ? void 0 : _e2.orderHistory.map(({
    side,
    baseCoinType,
    quoteCoinType,
    price,
    orderType,
    time,
    quantity
  }) => ({
    side,
    market: getMarketNameByType(baseCoinType, quoteCoinType),
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
      return /* @__PURE__ */ jsx(wn, {
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
      children: [/* @__PURE__ */ jsx(jn, {
        className: "sm:col-span-6 md:col-span-4 md:row-span-2 h-full",
        children: /* @__PURE__ */ jsxs(Ge.Group, {
          children: [/* @__PURE__ */ jsxs(Ge.List, {
            className: "mb-8 border-b-2 border-primary-600",
            children: [/* @__PURE__ */ jsx(Ge, {
              className: "px-4 py-2 text-primary-200 border-b-4 border-transparent ui-selected:border-brand ui-selected:text-white",
              children: "Open Orders"
            }), /* @__PURE__ */ jsx(Ge, {
              className: "px-4 py-2 text-primary-200 border-b-4 border-transparent ui-selected:border-brand ui-selected:text-white",
              children: "Filled Orders"
            })]
          }), /* @__PURE__ */ jsxs(Ge.Panels, {
            children: [/* @__PURE__ */ jsx(Ge.Panel, {
              children: /* @__PURE__ */ jsx(Vn, {
                columns: orderColumns,
                data: orderData
              })
            }), /* @__PURE__ */ jsx(Ge.Panel, {
              children: /* @__PURE__ */ jsx(Vn, {
                columns: filledOrderColumns,
                data: filledOrderData
              })
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs(jn, {
        className: "sm:col-span-6 md:col-span-2",
        children: [/* @__PURE__ */ jsx(En, {
          children: "Holdings"
        }), holdingsData == null ? void 0 : holdingsData.map((coin, index2) => /* @__PURE__ */ jsxs("div", {
          className: "p-2 my-2 flex flex-row content-center rounded-xl bg-primary-800 shadow-md",
          children: [/* @__PURE__ */ jsx(Gr, {
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
      }), /* @__PURE__ */ jsxs(jn, {
        className: "sm:col-span-6 md:col-span-2",
        children: [/* @__PURE__ */ jsx(En, {
          children: "Pools"
        }), poolData == null ? void 0 : poolData.map((pool, index2) => /* @__PURE__ */ jsxs("div", {
          className: "p-4 my-2 flex flex-row items-center rounded-xl bg-primary-800 shadow-md",
          children: [/* @__PURE__ */ jsx(xn, {
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
      children: /* @__PURE__ */ jsx(Vn, {
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
    }) => ask)) != null ? _a2 : []).sort((a, b) => {
      var _a3, _b2;
      return ((_a3 = a == null ? void 0 : a.price) != null ? _a3 : 0) < ((_b2 = b == null ? void 0 : b.price) != null ? _b2 : 0) ? 1 : -1;
    });
  }, [items]);
  const bids = react.exports.useMemo(() => {
    var _a2;
    return ((_a2 = items.map(({
      bid
    }) => bid)) != null ? _a2 : []).sort((a, b) => {
      var _a3, _b2;
      return ((_a3 = a == null ? void 0 : a.price) != null ? _a3 : 0) < ((_b2 = b == null ? void 0 : b.price) != null ? _b2 : 0) ? 1 : -1;
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
      children: /* @__PURE__ */ jsx(Vn, {
        ...askOrderTableProps
      })
    }), /* @__PURE__ */ jsx("div", {
      ref: bidTableRef,
      className: "relative overflow-y-scroll h-full max-h-full pt-4",
      children: /* @__PURE__ */ jsx(Vn, {
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
  } = _t();
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
    children: [/* @__PURE__ */ jsx(Ge.Group, {
      onChange: setActiveTab,
      children: /* @__PURE__ */ jsx(In, {
        tabs
      })
    }), /* @__PURE__ */ jsx(Rn, {
      options: Object.entries(OrderType).map(([key, val]) => ({
        value: val,
        label: key
      })),
      label: "Type",
      onChange: onChangeOrderType,
      value: selectedOrderType,
      className: "w-full min-w-full"
    }), /* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx(On, {
        className: "w-full",
        value: priceInput,
        onChange: onChangePrice,
        name: "price",
        label: "Price",
        suffix: secondCoin == null ? void 0 : secondCoin.symbol
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex w-full gap-2 pt-2",
        children: [/* @__PURE__ */ jsx(Pe, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "Mid"
        }), /* @__PURE__ */ jsx(Pe, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "Bid"
        }), /* @__PURE__ */ jsx(Pe, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "-1%"
        }), /* @__PURE__ */ jsx(Pe, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "-5%"
        }), /* @__PURE__ */ jsx(Pe, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "-10%"
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx(On, {
        value: cxAmount,
        onChange: onChangeCxAmount,
        name: "coinx",
        label: "Amount",
        suffix: firstCoin == null ? void 0 : firstCoin.symbol,
        className: "w-full"
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex w-full gap-2 pt-2",
        children: [/* @__PURE__ */ jsx(Pe, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "25%"
        }), /* @__PURE__ */ jsx(Pe, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "50%"
        }), /* @__PURE__ */ jsx(Pe, {
          size: "xs",
          variant: "basic",
          onClick: () => {
          },
          children: "75%"
        }), /* @__PURE__ */ jsx(Pe, {
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
        children: ["IOC", /* @__PURE__ */ jsx(kn, {
          enabled: ioc,
          onChange: onChangeIOC
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-start gap-2",
        children: ["Post", /* @__PURE__ */ jsx(kn, {
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
    }), /* @__PURE__ */ jsx(Pe, {
      onClick: submitTrade,
      size: "sm",
      children: "Submit Trade"
    })]
  });
}
function usePositionsTable() {
  var _a, _b, _c, _d, _e2, _f;
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
      count: (_f = (_e2 = (_d = positions.data) == null ? void 0 : _d.account) == null ? void 0 : _e2.poolPositions.length) != null ? _f : 0,
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
  const [wallet, , connection] = useWallet();
  const [cancelOrder] = useMutation(CancelOrderDocument);
  const orders = useOrders();
  const tableRef = react.exports.useRef(null);
  const tableProps = react.exports.useMemo(() => {
    var _a, _b, _c;
    return {
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
  }, [connection == null ? void 0 : connection.address, orders.data]);
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
    var _a2, _b2;
    return {
      data: (_a2 = tradeHistory == null ? void 0 : tradeHistory.map(({
        time,
        ...trade
      }) => {
        var _a3;
        return {
          ...trade,
          time: (_a3 = DateTime.fromJSDate(new Date(Number(time))).toRelative()) != null ? _a3 : ""
        };
      })) != null ? _a2 : [],
      columns: [{
        accessorKey: "side",
        header: "Side"
      }, {
        accessorKey: "baseCoinType",
        header: "Coin X",
        cell(cell) {
          var _a3;
          const val = cell.getValue();
          const name = (_a3 = getMarketCoinByType(val)) == null ? void 0 : _a3.name;
          console.log(name);
          return name != null ? name : "-";
        }
      }, {
        accessorKey: "quoteCoinType",
        header: "Coin Y",
        cell(cell) {
          var _a3;
          const val = cell.getValue();
          const name = (_a3 = getMarketCoinByType(val)) == null ? void 0 : _a3.name;
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
        count: (_b2 = tradeHistory == null ? void 0 : tradeHistory.length) != null ? _b2 : 0,
        estimateSize: () => {
          var _a3;
          return (_a3 = tradeHistory == null ? void 0 : tradeHistory.length) != null ? _a3 : 0;
        },
        getScrollElement: () => tableRef.current,
        overscan: 20
      }
    };
  }, [tradeHistory, getMarketCoinByType]);
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
  var _a, _b;
  const balancesQuery = useBalances();
  const tableRef = react.exports.useRef(null);
  const balances = (_b = (_a = balancesQuery.data) == null ? void 0 : _a.account) == null ? void 0 : _b.balances;
  const tableProps = react.exports.useMemo(() => {
    var _a2;
    return {
      data: balances != null ? balances : [],
      columns: [{
        accessorKey: "coinInfo",
        header: "",
        cell(cell) {
          const coinInfo = cell.getValue();
          return /* @__PURE__ */ jsx(Gr, {
            coin: coinInfo == null ? void 0 : coinInfo.symbol,
            size: 32
          });
        }
      }, {
        accessorKey: "coinInfo",
        header: "Symbol",
        cell(cell) {
          var _a3;
          const coinInfo = cell.getValue();
          return (_a3 = coinInfo == null ? void 0 : coinInfo.symbol) != null ? _a3 : "-";
        }
      }, {
        accessorKey: "availableBalance",
        header: "Available Balance"
      }, {
        accessorKey: "balance",
        header: "Balance"
      }],
      virtualizeOptions: {
        count: (_a2 = balances == null ? void 0 : balances.length) != null ? _a2 : 0,
        estimateSize: () => {
          var _a3;
          return (_a3 = balances == null ? void 0 : balances.length) != null ? _a3 : 0;
        },
        getScrollElement: () => tableRef.current,
        overscan: 20
      }
    };
  }, [balances]);
  return [tableProps, tableRef];
}
function TradeView({}) {
  var _a, _b, _c, _d, _e2, _f, _g, _h, _i, _j, _k;
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
  const lastPriceRef = react.exports.useRef(0);
  const [priceDiff, setPriceDiff] = react.exports.useState(0);
  const [priceDiffPct, setPriceDiffPct] = react.exports.useState(0);
  react.exports.useEffect(() => {
    const s2 = Math.sign(lastTradePrice - lastPriceRef.current);
    const _priceDiffPct = Math.abs(1 - lastTradePrice / lastPriceRef.current);
    const _priceDiff = Math.abs(lastTradePrice - lastPriceRef.current);
    console.log({
      _priceDiff,
      _priceDiffPct,
      lastTradePrice,
      lastPriceRef: lastPriceRef.current
    });
    if (_priceDiff)
      setPriceDiff(_priceDiff);
    if (_priceDiffPct)
      setPriceDiffPct(Number(_priceDiffPct.toFixed(6)));
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
      children: [/* @__PURE__ */ jsx(bn, {
        title: "",
        value: lastTradePrice,
        priceDirection,
        valueChange: priceDiff,
        percentChange: priceDiffPct,
        className: "mx-1 ml-1"
      }), /* @__PURE__ */ jsx(bn, {
        title: "24hr High",
        value: (_c = (_b = (_a = marketQuery.data) == null ? void 0 : _a.market) == null ? void 0 : _b.high24h) != null ? _c : "-",
        className: "mx-1"
      }), /* @__PURE__ */ jsx(bn, {
        title: "24hr Low",
        value: (_f = (_e2 = (_d = marketQuery.data) == null ? void 0 : _d.market) == null ? void 0 : _e2.low24h) != null ? _f : "-",
        className: "mx-1"
      }), /* @__PURE__ */ jsx(bn, {
        title: "24hr Volume",
        value: (_i = (_h = (_g = marketQuery.data) == null ? void 0 : _g.market) == null ? void 0 : _h.volume24h) != null ? _i : "-",
        className: "ml-1"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: " md:col-span-1 md:row-span-4 h-full md:border-r md:border-t md:border-t-primary-700 md:border-r-primary-700",
      children: [/* @__PURE__ */ jsx(Ge.Group, {
        selectedIndex: marketEventTab,
        onChange: setMarketEventTab,
        children: /* @__PURE__ */ jsx(In, {
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
      children: [/* @__PURE__ */ jsx(Ge.Group, {
        selectedIndex: orderTableTab,
        onChange: setOrderTableTab,
        children: /* @__PURE__ */ jsx(In, {
          tabs: orderTableTabs
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "max-w-full w-full h-full overflow-y-scroll mt-3 max-h-[250px]",
        ref: getTableRef(orderTableTab),
        children: [orderTableTab === 0 && /* @__PURE__ */ jsx(Vn, {
          columns: openOrderTableProps.columns,
          data: openOrderTableProps.data,
          virtualizeOptions: openOrderTableProps.virtualizeOptions,
          customRowRender: openOrderTableProps.customRowRender,
          className: openOrderTableProps.className
        }), orderTableTab === 2 && /* @__PURE__ */ jsx(Vn, {
          columns: tradeHistoryTableProps.columns,
          data: tradeHistoryTableProps.data,
          virtualizeOptions: tradeHistoryTableProps.virtualizeOptions,
          customRowRender: tradeHistoryTableProps.customRowRender,
          className: tradeHistoryTableProps.className
        }), orderTableTab === 1 && /* @__PURE__ */ jsx(Vn, {
          columns: orderHistoryTableProps.columns,
          data: orderHistoryTableProps.data,
          virtualizeOptions: orderHistoryTableProps.virtualizeOptions,
          customRowRender: orderHistoryTableProps.customRowRender,
          className: orderHistoryTableProps.className
        }), orderTableTab === 3 && /* @__PURE__ */ jsx(Vn, {
          columns: balanceTableProps.columns,
          data: balanceTableProps.data,
          virtualizeOptions: balanceTableProps.virtualizeOptions,
          customRowRender: balanceTableProps.customRowRender,
          className: balanceTableProps.className
        })]
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
  const NO_POOLS_UI = /* @__PURE__ */ jsx(jn, {
    className: "text-center mt-[200px] max-w-[400px] self-center border-primary-700 border",
    children: "No Pools Available"
  });
  const renderLiquidityItem = (pool) => {
    return /* @__PURE__ */ jsxs(jn, {
      className: "flex justify-between hover:bg-primary-900/70 hover:cursor-pointer border-primary-700 border",
      onClick: () => goToPoolInfo(pool.coinInfoX.coinType, pool.coinInfoY.coinType),
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex items-center",
          children: /* @__PURE__ */ jsx(xn, {
            coins: [pool.coinInfoX.symbol, pool.coinInfoY.symbol],
            size: 48
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "self-center ml-4 text-xl",
          children: `${pool.coinInfoX.name} / ${pool.coinInfoY.name}`
        })]
      }), /* @__PURE__ */ jsx(bn, {
        title: `${pool.coinInfoX.name} Locked`,
        value: pool.amountX
      }), /* @__PURE__ */ jsx(bn, {
        title: `${pool.coinInfoY.name} Locked`,
        value: pool.amountY
      }), /* @__PURE__ */ jsx(bn, {
        title: "Fee Perecent",
        value: (pool == null ? void 0 : pool.feePercent) ? `${pool.feePercent}%` : "-"
      }), /* @__PURE__ */ jsx(Pe, {
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
      }), /* @__PURE__ */ jsx(Pe, {
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
  const connectEl = /* @__PURE__ */ jsx(Pe, {
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
      children: [/* @__PURE__ */ jsx(oe, {
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
  return /* @__PURE__ */ jsxs(jn, {
    className: "w-[700px] mx-auto self-center justify-self-center",
    children: [/* @__PURE__ */ jsx(En, {
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
    }), /* @__PURE__ */ jsx(Pe, {
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
          children: [/* @__PURE__ */ jsx(Cn, {}), /* @__PURE__ */ jsx(Header, {}), /* @__PURE__ */ jsx("div", {
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
