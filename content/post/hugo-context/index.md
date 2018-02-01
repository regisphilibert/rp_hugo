---
title: "Hugo, the scope, the context and the dot."
date: 2018-01-17T15:32:27-05:00
draft: true
---

#### notes
Testdrive Render, mabe it is the good article to talk about it
Investigage blocks template
## 
Moving from old regular template languages where the scope is rarely an issue, you may have a hard time wrapping your head around Go Template scoping constraints. 

In this article we’ll try and understand the impact of the scope within our templates and discipline ourselves as to simplify things.

## The context and the dot

I’m using the word scope in the title here, because it’s what first come to mind when dealing with the issue and I guess what people will want to research on. But I suppose we’ll be more talking about the « context »

The scope is really what functions, objects, variables are available to you at a certain point in your code. From inside a function or a class for exemple.

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

	{{ with .Title }}
	 // Here the dot is now .Title
	{{ . }} > the title
	{{ end }}

From within this `with` you’ve lost your page context. The context, the dot is now the title of your page and while it is no big deal in this situation, (.Title is all you need) it may have you lose your mind later. 

Same goes with range

Once you’ve opened an iteration with range the context is the object the cursor is pointing to at the moment.

	{{ range .Resources }}
	 // Here the dot is the one resource.
	{{ .Permalink }} > the title
	{{ end }}

There you’ve lost your page and from now on the dot will point to the resource along with its own properties. 
So coincidently .Permalink is there but it isn’t your page’s anymore it’s the resource’s which happens to also have a Permalink property 😀

## Of course and most importantly same goes with partials. 

Now partials allow you to pass a context as its one parameter. This object will be available within the partial and be referred to as, you guessed it, the dot.

So for simple partials you will only need your page context. Your page’s dot. 

	{{ partial "header" . }}

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

The dot is that $path value.

But what if I need more than the page context or whatever context I passed along. What if I had a variable stored and wanted it available form within my partial.

You can use the dict function to pass an object as parameter. dict creates a map or as I more commonly know it, an associative array. See the doc or my own take on it here.

Within the partial your dot will hold that object. 

$context = dict Color blue Size ten
Partial $context 

~~~go
{{ partial "img" dict("path" $path "alt" "Nice blue sky") }}
~~~

~~~go
<figure class="Figure Figure--framed">
	<img src="{{ .path }}" alt="{{ .alt }}">
</figure>
~~~

You can choose to capitalize your keys so they look more like what we're used to, but I like having them lowercase, so I know this is a custom dict I'm dealing with here and not the Page context.

Very often, most of the time, you will need your page context as well. Which means, if you only need one value to be passed along, well you’ll still have to use dict. because partial only takes one parameter, one object as context.

You can use any name for that important key a lot of people use « context » reasulting in ‘context.Title’ whatever suits you, just try and be consistent with it.

~~~go
{{ partial "img" dict("context" . "path" $path "alt" "Nice blue sky") }}
~~~

~~~go
<figure class="Figure Figure--framed">
	<img src="{{ .path }}" alt="{{ .alt }} from {{ .context.Site.Title }}">
</figure>
~~~

Now this is going to be cumbersome. We really would love just to have the page context in there.

## Nesting partials

Remember, as long as you only pass a context, and always remember to pass it to any nested partial, you will have this context ready to use from any depth of partial nesting. But we way find some benefint trying no to nest partial too much for better code readability.

## Nesting discipline
Mostly we need to discipline ourselves with partial in order to avoid too much nesting or if possible, any nesting at all.

I recently reworked to \<head\> portion of my side to do just that.

I used to load a partial called head which would contain all tags related to scripts and styles etc… and from within this partial, load another partial called seo and which would deal with all the og, twitter and other important indexing metas.

It is obvious I did this by reflex but really didn’t need any partial nesting. I can really just include the head opening and closing in my baseof and load 2 partials fromt here. One for regular tags and another one for seo.
