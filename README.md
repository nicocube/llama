# Llama toolkit

Wooly, sure-footed, a thin layer above vanilla JS for SPA dev (no dependencies).

Provides:

*   a Component API
*   an event-bus
*   a router

# API Doc

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

*   [llama](#llama)
    *   [Parameters](#parameters)
*   [RouteTarget](#routetarget)
    *   [Properties](#properties)
*   [Component](#component)
    *   [Parameters](#parameters-1)
    *   [listen](#listen)
    *   [call](#call)
    *   [load](#load)
    *   [unload](#unload)
    *   [prepareBox](#preparebox)
    *   [populate](#populate)
    *   [addChildren](#addchildren)
    *   [removeChildren](#removechildren)
    *   [init](#init)
    *   [postLoad](#postload)
    *   [clean](#clean)
    *   [on](#on)
    *   [emit](#emit)
    *   [gId](#gid)
    *   [addEvtById](#addevtbyid)
    *   [hasHTML](#hashtml)
    *   [empty](#empty)
    *   [fragmentFromHtml](#fragmentfromhtml)
    *   [injectCSS](#injectcss)
    *   [injectHTML](#injecthtml)
*   [HostComponent](#hostcomponent)
    *   [setSubRoute](#setsubroute)
*   [SimpleEventBus](#simpleeventbus)
    *   [Parameters](#parameters-18)
    *   [on](#on-1)
    *   [emit](#emit-1)
    *   [clear](#clear)
*   [SequenceEventBus](#sequenceeventbus)
    *   [Parameters](#parameters-22)
    *   [on](#on-2)
    *   [emit](#emit-2)
    *   [clear](#clear-1)
*   [Router](#router)
    *   [Parameters](#parameters-26)
    *   [routes](#routes)
    *   [before](#before)
    *   [on](#on-3)
    *   [run](#run)
    *   [stop](#stop)
    *   [go](#go)
    *   [route](#route)

## llama

Set all the Llama goodness together

### Parameters

*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** the configuration options

    *   `options.box` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** the id of the div we load components in
    *   `options.eventBus` **EventBus?** an event-bus to pass to the different Components
    *   `options.context` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** a shared context object for all the routes
    *   `options.routes` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), (Class<[Component](#component)> | [RouteTarget](#routetarget))>** the description of routes
    *   `options.logger` **[Console](https://developer.mozilla.org/docs/Web/API/Console)?** define a logger, can be {logger: console} to send on the javascript console

## RouteTarget

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### Properties

*   `type` **Class<[Component](#component)>?**&#x20;
*   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** name of the component to serve as source for event listeners
*   `box` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** the id of an HTML element the component is rendered into
*   `sub_box` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** the id of an HTML element the embedded sub-component are rendered into
*   `css` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** a string of CSS to be injected
*   `logger` **[Console](https://developer.mozilla.org/docs/Web/API/Console)?** define a logger, can be {logger: console} to send on the javascript console
*   `embed` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [RouteTarget](#routetarget)>** embedded route

## Component

Common ground for vanilla Widget Component

### Parameters

*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** a set of option al

    *   `options.name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** name of the component to serve as source for event listeners
    *   `options.box` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** the id of the HTMLElement to which we want to plug the component
    *   `options.eventBus` **EventBus?** to receive and send events
    *   `options.context` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), any>?**&#x20;
    *   `options.logger` **[Console](https://developer.mozilla.org/docs/Web/API/Console)?** define a logger, can be {logger: console} to send on the javascript console
    *   `options.css` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?**&#x20;

### listen

Listen events

### call

Call for loading of the component

#### Parameters

*   `args` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;

### load

Load component inside the box

#### Parameters

*   `args` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;

### unload

Unload component

### prepareBox

Returns **(ShadowRoot | [HTMLElement](https://developer.mozilla.org/docs/Web/HTML/Element))**&#x20;

### populate

#### Parameters

*   `args` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;

### addChildren

#### Parameters

*   `args` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?**&#x20;
*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?**&#x20;
*   `children` **...[Component](#component)**&#x20;

### removeChildren

#### Parameters

*   `children` **...[Component](#component)**&#x20;

### init

init the component after appending to DOM

#### Parameters

*   `args` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;

### postLoad

activate after load

#### Parameters

*   `args` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;

### clean

clean the component after removing from DOM

### on

Attach an event listener for this source component

#### Parameters

*   `e` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>)** the event(s) key(s) to attach the listener
*   `f` &#x20;

### emit

Emit an event for a given key that are sent to every attached events listeners

#### Parameters

*   `k` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the event key
*   `p` **...any** the optional args

### gId

#### Parameters

*   `id` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;

Returns **[HTMLElement](https://developer.mozilla.org/docs/Web/HTML/Element)**&#x20;

### addEvtById

#### Parameters

*   `id` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;
*   `evt` **any**&#x20;
*   `cb` **any**&#x20;

### hasHTML

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**&#x20;

### empty

Clear the box contents

#### Parameters

*   `box` **[Node](https://developer.mozilla.org/docs/Web/API/Node/nextSibling)**  (optional, default `this.prepareBox()`)

### fragmentFromHtml

Generate DOM Element from source HTML

#### Parameters

*   `html` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** some HTML code

Returns **[DocumentFragment](https://developer.mozilla.org/docs/Web/API/DocumentFragment)** the generated DOM Element

### injectCSS

Inject component defined CSS into the box (if it exists)

#### Parameters

*   `box` **[Node](https://developer.mozilla.org/docs/Web/API/Node/nextSibling)**  (optional, default `this.prepareBox()`)

### injectHTML

Inject component defined HTML into the box (if it exists)

#### Parameters

*   `box` **[Node](https://developer.mozilla.org/docs/Web/API/Node/nextSibling)**  (optional, default `this.prepareBox()`)
*   `args` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?**&#x20;
*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?**&#x20;

## HostComponent

A component that host embedded Component

### setSubRoute

#### Parameters

*   `subRoute` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)>**&#x20;

## SimpleEventBus

A simple event bus to enable event-driven architecture

### Parameters

*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** optional parameters

    *   `options.name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** define a name, in a multi EventBus scenario
    *   `options.logger` **[Console](https://developer.mozilla.org/docs/Web/API/Console)?** define a logger, can be {logger: console} to send on the javascript console

### on

Attach an event listener for a source

#### Parameters

*   `s` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** name of the source of the listener
*   `e` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>)** the event(s) key(s) to attach the listener
*   `f` &#x20;

### emit

Emit an event for a given key that are sent to every attached events listeners

#### Parameters

*   `k` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the event key
*   `p` **...any** the optional args

### clear

Clear event listeners for a source

#### Parameters

*   `s` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the name of the source to clear events for
*   `filter`   (optional, default `()=>true`)

## SequenceEventBus

A Complex event bus to enable event-driven architecture with a before and after event hook

### Parameters

*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** optional parameters

    *   `options.logger` **[Console](https://developer.mozilla.org/docs/Web/API/Console)?** define a logger, can be {logger: console} to send on the javascript console

### on

Attach an event listener for a source

#### Parameters

*   `s` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** name of the source of the listener
*   `e` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>)** the event(s) key(s) to attach the listener
*   `f` &#x20;

### emit

Emit an event for a given key that are sent to every attached events listeners

#### Parameters

*   `k` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the event key
*   `p` **...any** the optional args

### clear

Clear event listeners for a source

#### Parameters

*   `s` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the name of the source to clear events for
*   `filter`   (optional, default `()=>true`)

## Router

A simple router for Llama Component

### Parameters

*   `eventBus` **EventBus**&#x20;
*   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?**&#x20;

    *   `options.logger` **[Console](https://developer.mozilla.org/docs/Web/API/Console)?** define a logger, can be {logger: console} to send on the javascript console

### routes

#### Properties

*   `routes` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<Path>**&#x20;

### before

#### Parameters

*   `action` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)**&#x20;

### on

#### Parameters

*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;
*   `action` **([function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) | [Component](#component))**&#x20;

### run

Run the router

### stop

Stop the router

### go

Go to a route matching the given path

#### Parameters

*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;

### route

Route the browser
