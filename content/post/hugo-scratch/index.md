---
date: 2017-04-03T10:13:39-05:00
lastmod: 2018-01-19T10:11:00-05:00
aliases:
 - /2017/04/hugo-scratch-explained-variable
tags:
 - Hugo
 - Scratch
 - Variables
 - Go Template
title: Hugo .Scratch explained
slug: hugo-scratch-explained-variable
description: Working variables in Hugo can be complicated when coming from classic languages. The only way to override variables or attach any kind of value to a .Page object is to use .Scratch.
---

Working variables in Hugo can be complicated when coming from classic languages.

What you usually do :

~~~php
<?php
$greetings = "Good Morning";
if($sky == "dark"){
	$greetings = "Good Night";
}
// Or even better:
$greetings = $sky == "dark" ? "Good Night : Good Morning";

~~~

That next bit of code would be tempting :
~~~go
{{ $greetings := "Good Morning" }}
{{ if eq $sky "dark" }}
	{{ $greetings = "Good Night" }}
{{ end }}
{{ $greetings }}
~~~

But that won't happen 😞

To achieve this, you need __.Scratch__ so let's dive in!
<!--more-->

At least until [this Golang issue](https://github.com/golang/go/issues/10608) gets fixed with Go 1.11 in july, the only way to override variables or attach any kind of custom value to a *.Page* object is to use *.Scratch* 

*.Scratch* is a life saver but its [documentation](https://gohugo.io/extras/scratch/) is a bit light if, like me, you are not comfortable with the Go language.

## We need .Scratch!

.Scratch was initially added to fight the Go Template limitation mentionned above but ended up doing much more. 
It comes with several methods.

### .Scratch.Set

You use *Set* to store a value and maybe later perform a simple override. 
Taking our PHP exemple above, we'd have something like that:

~~~go
{{ .Scratch.Set "greetings" "Good Morning" }}
{{ if eq $sky "dark" }}
	{{ .Scratch.Set "greetings" "Good Night" }}
{{ end }}

{{ .Scratch.Get "greetings"}}
~~~

### .Scratch.Add

This will deal with adding or pushing mutliple values to the same variable or key.

~~~go
//For strings.
{{ .Scratch.Add "greetings" "Hello" }}
{{ .Scratch.Add "greetings" "Goodbye" }}

{{ .Scratch.Get "greetings" }}
//Will output : HelloGoodbye
~~~

Using add with _slice_, will append one or more values to an array/slice.

~~~go
{{ .Scratch.Add "greetings" (slice "Hello") }}
{{ .Scratch.Add "greetings" (slice "Goodbye") }}
{{ .Scratch.Add "greetings" (slice "Aloha" "Buenos dias") }}
~~~

### .Scratch.Get

Now to get it.

~~~go
//With range
{{ range .Scratch.Get "greetings" }}
<ol>
	<li>
		{{ . }}
	</li>
</ol>
{{ end }}
//Will output that ordered list with our 4 greetings.

//Or with delimit
//Will output Hello, Goodbye, Aloha, Buenos dias
{{ delimit (.Scratch.Get "greetings"), ", " }}


~~~ 

## Working with arrays or maps

### .Scratch.SetInMap

This one allows to target a key from inside an array and assign it a new value. First parameter is your .Scratch key, second parameter is the key from within the array or map and the third one is your value.

<small>If you don't know about [dict](https://gohugo.io/functions/dict/#readout) I explain about it [here]({{< ref "post/hugo-translator/index.md#associative-arrays" >}})</small>

~~~go
{{ .Scratch.Add "greetings" (dict "english" "Hello" "french" "Bonjour") }}

{{ .Scratch.SetInMap "greetings" "english" "Howdy 🤠" }}

//We changed the english greeting from Hello to Howdy 🤠!
  
~~~


## Watch out for scope and context...

.Scratch is for the page object or the shortcode object. You cannot use it on any other element. 

Remember that if you are inside a range on your index page, then your index page's .Scratch will be __$.Scratch__ while the page you are currently rangeing on, will be __.Scratch__. 

Also remember that you can attach a key/value to .Scratch from anywhere, even whithin a partial as long as your passed the context to it. Whaaaaat? Let's use a practical scenario to walk though the perilous path of context and .Scratch

### .Scratch with class, a use case.

I find it convenient to attach classes to my body element (You from Wordpress?) to allow css/javascript adjustments according to which page we're on.

I found this to be very tedious to achieve with Hugo until I understood .Scratch.

What I want to do is add "rp-body" css class to all my pages as well as the .Section value to my classes.

Also only the home page should have the "rp-home" class. 

I could do that work once, in the partial or template which includes the opening body tag but... I may need that list of classes elsewhere in my code for some ajax magic. Say as a javascript object. 

How do I build this list, modify it if I'm on the home page, and store it to my .Page object for future use ? We'll store our classes in a array for convenience.

~~~go
//Before my body tag I can store my first and universal class.
{{ .Scratch.Add "classes" (slice "rp-body") }}

//Then my section. That printf allows me to to prepend the .Section Value with my prefix.
{{ .Scratch.Add "classes" (slice (printf "rp-%s" .Section))) }}

// Now is this the home page ?
{{ if .IsHome }}
	{{ .Scratch.Add "classes" (slice "rp-home") }}
{{end}}
// Is this a holyday? 🎄
{{ if isset .Site.Params "season" }}
	{{ .Scratch.Add "classes" (slice (printf "rp-body--%s" .Site.Params.season))) }}
{{ end }}
~~~
We could perform a lot more checking and scratching but eventually, in our layout we drop that beauty:
~~~go
<body class='{{ delimit (.Scratch.Get "classes") " " }}'>
~~~

And for javascript we can create our object anywhere needed.

~~~go
<script>
	let bodyClasses = [{{ range .Scratch.Get "classes" }}"{{ . }}", {{end}}];
</script>
~~~

Good use case, let's keep walking.

### *.Scratch* from within a partial

As I explained earlier, because .Scratch is part of the page object usually passed on as context to partials (yeah that dot), you could, for readability/refactoring purposes, decide to wrap all the classname scratching from above inside a partial like so:

~~~go
// partials/scratching/body_classes.html
{{ .Scratch.Add "classes" (slice "rp-body") }}
[... blah blah blah same as above ...]
~~~
And in my layout file:
~~~go
{{ partial "scratching/body_classes.html" . }}
<body class='{{ delimit (.Scratch.Get "classes") " " }}'>
[...]
~~~

The page's .Scratch has been passed along to the partial with its context, so you can play with it from whithin, and still have it ready for the code outside the partial. Plus that's a clean layout file!

### *.Scratch* from inside a partial from inside a range 🤯
Once your inside a range, you cannot, as with partials, pass on a defined context, you end up with the context of the range, which is the behaviour you want.

~~~go
	{{ .Scratch.Set "section_color" }}
	{{ range where .Data.Pages}}
	    <h2>{{ .Title }}</h2>
	    <div class="Child Child--{{ $.Scratch.Get section_color}}">
	    [...]
	    <div>
	{{ end }}
	// Will  display that section_color.
	// But...
	{{ range where .Data.Pages }}
	    {{ partial "child.html" . }}
	{{ end }}
	// The child.html partial won't be able to retrieve the index page .Scratch even though the . was passed along...
~~~

That is because the context you passed along the partial is the range context, the page your cursor is currently at, and not, as you could expect the archive page whose template your are coding on.

OK! But I still need to use the root page's .Scratch. from whithin this partial...

Well, you could pass along the root page's .Scratch after having stored it in a variable.
~~~go
	{{ $indexScratch := .Scratch }}
	{{ range where .Data.Pages }}
	    {{ partial "child.html" $indexScratch }}
	{{ end }}
~~~
And inside that partial
~~~go
    <div class="Child Child--{{ .Get "section_color" }}">
    [...]
    <div>
~~~

And if you also need the context of the page you are rangeing on, then use dict
~~~go
	{{ $indexScratch := .Scratch }}
	{{ range where .Data.Pages }}
	    {{ partial "child.html" (dict "indexScratch" $indexScratch "page" . }}
	{{ end }}
~~~
And inside that partial
~~~go
    <div class="Child Child--{{ .indexScratch.Get section_color}}">
    	{{ .page.Content }}
    <div>
~~~

## .Scratch after Go 1.11 
Yes, the Golang team will eventually roll out version 11 and we'll be able to natively override variables in Go Template;

~~~go
// Allas!
{{ $greetings := "Good Morning" }}
{{ if eq $sky "dark" }}
	{{ $greetings = "Good Night" }}
{{ end }}
{{ $greetings }}
~~~

But .Scratch will still be needed to attach key/values to a page or shortcode context. Without it, you'll be left with a lot of context meddling.

### Without .Scratch (Go v11)
~~~go
{{ $mood := "Happy" }}
{{ if $rain }}
	{{ $mood = "Grumpy" }}
{{ end }}
{{ partial "snowwhite/dwarf.html" (dict "mood" $mood "page" . ) }}
~~~

### With .Scratch (right now)
~~~go
{{ .Scratch.Set "mood" "Happy" }}
{{ if $rain }}
	{{ .Scratch.Set "mood" "Grumpy" }}
{{ end }}
{{ partial "snowwhite/dwarf.html" . }}
~~~

Beside, I don't think meddling with complex maps could be as convenient as it currently is with __.Scratch.SetInMap__!