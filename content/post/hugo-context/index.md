---
title: "Hugo, the scope, the context and the dot"
date: 2018-02-05T15:32:27-05:00
description: Moving from old regular template languages where the scope is rarely an issue, you may have a hard time wrapping your head around Go Template scoping constraints. Why is my variable not available here or there ? Let's see how, in Hugo, the scope or rather the context works.
slug: 'hugo-the-scope-the-context-and-the-dot'
toc: true
featured: true
tags:
 - Hugo
 - Variables
 - Go Template
 - Context
 - Dot
---

Moving from old regular template languages where the scope is rarely an issue, you may have a hard time wrapping your head around Go Template scoping constraints. Why is my variable not available here or there ?

In this article we’ll try and understand the impact of the scope or context within our templates and discipline ourselves to always know what is available and what is not.

## The context and the dot

I’m using the word scope in the title here, because it’s what first come to mind when dealing with the issue and I guess what people will eventually seek help for. But I suppose we’ll be talking more about the « context »

The scope is really what is available to you at a certain point in your code. From inside a function or a class for exemple.

But in Hugo Templates, most of the time, only one object is available to you: __the context__. 
And it is stored in a dot.

Yep, that dot. `{{.}}` 

So you end up using the properties of this object like so:
 `.Title`, `.Permalink`, `.IsHome`

## The Page dot.

The root context, the one available to you in your `baseof.html` and layouts will always be the Page context. Basically everything you need to display this page is in that dot. 
.Title, .Permalink, .Resources, you name it.

Even your site’s informations is stored in the page context with `.Site` ready for the taking. 

But in Go Template the minute you step into a function you lose that context and your precious dot or context is replaced by the function's own... dot. 

So for exemple in my template 

### With

~~~go
{{ with .Title }}
 	{{/* Here the dot is now .Title */}} 
	<h1>{{ . }}</h1>
{{ end }}
~~~
From within this `with` you’ve lost your page context. The context, the dot, is now the title of your page. For now that's exactly what we want!

### Range

Same goes here, once you’ve opened an iteration with range the context is the whatever item the cursor is pointing to at the moment. You will lose your page context in favor of the the range context.

~~~go
{{ range .Data.Pages }}
	{{/* Here the dot is that one page 'at cursor'. */}} 
	{{ .Permalink }}
{{ end }}
~~~


~~~go
{{ range .Resources.Match "gallery/*" }}
	{{/* Here the dot is that one image. */}} 
	{{ .Permalink }}
{{ end }}
~~~

~~~go
{{ range (slice "Hello" "Bonjour" "Gutten Tag") }}
	{{/* Here the dot is that one string. */}} 
	{{ . }}
{{ end }}
~~~

### The top level page context 💲

Luckily Hugo stores the root page context in a `$` so no matter how deeply nested you are within `with` or `range`, you can always retrieve the top page context.

#### One level nesting
~~~go
{{ with .Title }}
	{{/* Dot is .Title */}} 
	<h1>{{ . }}</h1>
 	{{/* $ is the top level page */}} 
	<h3>From {{ $.Title }}</h3>
{{ end }}
~~~

#### Three level nesting
~~~go
{{/* 1. Dot is the top level (list) page */}} 
<h1>{{ .Title }}</h1>
{{ range .Data.Pages }}
	<article>
		{{/* 2. Dot is the page at cursor */}} 
		<h3>{{ .Title }}</h3>
		<hr>
		{{ range .Resources.Match "images/.*" }}
			<figure>
				{{/* 3. Dot is that Resource */}}
				<img src="{{ .Permalink }}">
				{{/* $ is the top level page */}}
				<caption>{{ .Title }} from  post {{ $.Title }}</caption>
			</figure>		
		{{ end }}
	</article>
{{ end }}
~~~

## Partials

Partials, by default don't pass on any context.
But it takes one parameter just for that. This object will be available within the partial and be referred to as, you guessed it, the dot.

So for simple partials you will only need your page context. Your page’s __dot__. 

~~~go
	{{ partial "page/head" . }}
~~~

The partial function here has for parameter your context, most probably your Page’s if you're not in a `range` or a `with` or another partial.

~~~go
	<h1>
		{{ .Title }}
	</h1>
	<h3><time datetime="{{ .Date }}">{{ dateFormat "Written on January 2, 2006" .Date }}</time></h3>
~~~


Now, let's say you build a partial to render your a fancy framed image, you only need its path so that would be your context.

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

That is simple, most of the time, we'll need more than this. I can only pass one parameter, so one context.

You can use the `dict` function to pass an object as parameter. `dict` creates a map or as I more commonly know it, an associative array. See the [doc](https://gohugo.io/functions/dict) or my own take on it [here]({{< ref hugo-translator >}}#associative-arrays).

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

You can choose to capitalize your keys so they look more like what we're used to, but I like having them lowercase, this way from within that partial, I instantly identify this as a custom `dict` rather than a more conventional context.

### Top level $ from partial

Contrary to `range` and `with`, your page context will not be available in `$`

No fret, we'll just add the page context to our `dict`.

You can use any name for that important key, a lot of people use « context » reasulting in `.context.Title` whatever suits you, just try and be consistent with it.

~~~go
{{ partial "img" dict("context" . "path" $path "alt" "Nice blue sky") }}
~~~

~~~go
<figure class="Figure Figure--framed">
	<img src="{{ .path }}" alt="{{ .alt }} from {{ .context.Title }}">
</figure>
~~~

## Conclusion

That dot becomes super friendly and simple once you know how to juggle with it. It makes the code easy to read and adapt. You will find other context passing with `block` and `template`.

Happy dotting!

