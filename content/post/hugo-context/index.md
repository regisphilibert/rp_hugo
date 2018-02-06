---
title: "Hugo, the scope, the context and the dot"
date: 2018-02-5T15:32:27-05:00
---

Moving from old regular template languages where the scope is rarely an issue, you may have a hard time wrapping your head around Go Template scoping constraints. What is my variable not available here or there ?

In this article we’ll try and understand the impact of the scope or context within our templates and discipline ourselves to always know what is available and what is not.

## The context and the dot

I’m using the word scope in the title here, because it’s what first come to mind when dealing with the issue and I guess what people will eventually seek help for. But I suppose we’ll be talking more about the « context »

The scope is really what functions, objects, variables make available to you at a certain point in your code. From inside a function or a class for exemple.

But in Hugo Templates, most of the time, only one object is available to you, the context. And it is stored in a dot « . » 
Yep, that dot.
So you end up using the properties of this object like so:
 .Title, .Permalink, .IsHome

## The Page dot.

The root context, the one available to you in your baseof.html and layouts will always be the Page context. Basically everything you need to display this page is in that dot. 
.Title, .Permalink, .Resources, you name it.

Even your site’s informations is stored in the page context with .Site ready for the taking. 

But in Go template the minute you step into a function you lose that context and your precious dot or context is replaced by the function’s. 

So for exemple in my template 

~~~go
{{ with .Title }}
 	{{/* Here the dot is now .Title */}} 
	<h1>{{ . }}</h1>
{{ end }}
~~~
From within this `with` you’ve lost your page context. The context, the dot is now the title of your page and while it is no big deal in this situation, (.Title is all you need) it may have you lose your mind later.

Same goes with range

Once you’ve opened an iteration with range the context is the object the cursor is pointing to at the moment.

~~~go
{{ range .Resources }}
	{{/* Here the dot is the one resource. */}} 
	{{ .Permalink }} > the title
{{ end }}
~~~

There you’ve lost your page and from now on the dot will point to the resource along with its own properties. 
So coincidently `.Permalink` is there but it isn’t your page’s anymore it’s the resource’s which happens to also have a Permalink property 😀

### The top level page context 💲

Luckily Hugo stores the root page context in `$` so no matter how deep you are in nested within `with` or `range`, you can always retrieve the top page context.

~~~go
{{ with .Title }}
	<h1>{{ . }}</h1>
 	{{/* Here the page context is now $ */}} 
	<h3>From {{ $.Title }}</h3>
{{ end }}
~~~

## Of course and most importantly same goes with partials. 

Now partials allow you to pass a context as its one parameter. This object will be available within the partial and be referred to as, you guessed it, the dot.

So for simple partials you will only need your page context. Your page’s dot. 

~~~go
	{{ partial "header" . }}
~~~
The partial function here has for parameter your context, most probably your Page’s context if this line of code is within your baseof.html or say a « single.html » template. 

From within your partial it works like in your baseof or layout 

.Title .Permalink etc...

Now it could also be somethine else. 

Let's say you build a partial to render your a fancy framed image. You would pass its path as context

~~~go
{{ partial "img" $path }}
~~~
And in your partials/img.html

~~~go
<figure class="Figure Figure--framed">
	<img src="{{ . }}" alt="">
</figure>
~~~

The dot is that `$path` value.

But what if I need more than the page context or whatever context I passed along. What if I had a variable stored and wanted it available form within my partial.

You can use the dict function to pass an object as parameter. dict creates a map or as I more commonly know it, an associative array. See the [doc](https://gohugo.io/functions/dict) or my own take on it [here]({{< ref hugo-translator >}}#associative-arrays).

Within the partial your dot will hold that object. 

~~~go
{{ partial "img" dict("path" $path "alt" "Nice blue sky") }}
~~~

The context is still an object, so prefix with `.`

~~~go
<figure class="Figure Figure--framed">
	<img src="{{ .path }}" alt="{{ .alt }}">
</figure>
~~~

You can choose to capitalize your keys so they look more like what we're used to, but I like having them lowercase, so I know this is a custom `dict` I'm dealing with here and not the core context.
### Top level $ from partial

Contrary to `range` and `with`, your page context will not be available in `$`

Yet most of the time, you will need your page context as well. Which means, if you only need one value to be passed along, well you’ll still have to use `dict`. because partial only takes one parameter: one object as context.

You can use any name for that important key, a lot of people use « context » reasulting in `.context.Title` whatever suits you, just try and be consistent with it.

~~~go
{{ partial "img" dict("context" . "path" $path "alt" "Nice blue sky") }}
~~~

~~~go
<figure class="Figure Figure--framed">
	<img src="{{ .path }}" alt="{{ .alt }} from {{ .context.Site.Title }}">
</figure>
~~~

Now this is going to be cumbersome. We really would love just to have the page context in there.

### Passing dict is cumbersome

Well, to some it may be, there is an alternative though.

You can use .Scratch to add the value you need to the page context and only pass it along.

~~~go
{{ .Scratch.Set "image_path" $path }}
{{ .Scratch.Set "image_alt" "Nice blue sky" }}
{{ partial "img" . }}
~~~

~~~go
<figure class="Figure Figure--framed">
	<img src="{{ .Scratch.Get "image_path" }}" alt="{{ .Scratch.Get "image_alt" }} from {{ .Site.Title }}">
</figure>
~~~

Yes, we saved us the trouble of passing a dict as context to our partial, but burdened our partial with the .Scratch syntax. To each is own.

