---
title: "Multilingual in Hugo Part 2: String Localization"
date: 2018-08-23T14:38:22-04:00
slug: hugo-multilingual-part-2-i18n-string-localization
toc: true
tags:
 - Hugo
 - Multilingual
 - Localization
 - i18n
twitter_card: summary_large_image
---


In the first part of this Hugo’s Multilingual series, we covered how to manage our content translations in Hugo and use those in our templates.
  
But what about translating strings for your project or your theme?

In this second part, we’ll see how Hugo, using its familiar data structure and configuration file, allows us to localize strings in any number of languages with minimum hassle.

## Localizing our strings
When translating strings, Hugo uses a management system in the like of php’s `.po` files. 
Each language’s strings are stored in a file named after its language’s code and dropped in a `i18n/` directory. It can either live at the root of your project or theme.

Following our three languages from part one, they would look like the following

```yaml
# i18n/en.yaml 🇬🇧
- id: hello
  translation: "Hello"
- id: how_are_you
  translation: "How are you doing?"
```

```yaml
# i18n/fr.yaml 🇫🇷
- id: hello
  translation: "Bonjour"
- id: how_are_you
  translation: "Comment allez-vous ?"
```

```yaml
# i18n/es.yaml 🇪🇸
- id: hello
  translation: "Hola"
- id: how_are_you
  translation: "¿Como estas?"
```


As seen above all we need for each translated phrase is a `key` string and  a `translation` string.

Afterwards from our templates, Hugo’s [`i18n`](https://gohugo.io/functions/i18n/#readout) function does the localization job.

```go-html-template
<header>
	{{ i18n "hello" }}
	<hr>
	{{ i18n "how_are_you" }}
</header>
```

`i18n` will match the corresponding localized phrase to the string id passed as parameter:


```html
<!-- /es/index.html 🇪🇸 -->
<header>
	Hola
	<hr>
	¿Como estas?
</header>
```

```html
<!-- /fr/index.html 🇫🇷 -->
<header>
	Bonjour
	<hr>
	Comment allez-vous ?
</header>
```

## Pluralizing strings
Strings won’t always refer to lonely entities. Sometimes they qualify one thing, sometime more. So how can we make sure this phrase is always faithfully localized, single or plural? 

There is  the [`pluralize`](https://gohugo.io/functions/pluralize/#readout) template function but it only works in english. 

Luckily, Hugo’s string localization handles this perfectly.

The value for your `translation` key can also be a map of plural tags!
{{% notice %}}
To better illustrate the feature, we’ll be using examples involving... rodents 🐭! Don’t mind them as they make very interesting plurals in all three languages!
{{% /notice %}}


```yaml
# i18n/en.yaml 🇬🇧
- id: mouse
  translation:  
    one: Mouse
	other: Mice
```

Great, now our phrase has a singular version (`one`) and a default version (`other`) which will be our greeting’s plural.

Let’s fill in our other data files:

```yaml
# i18n/es.yaml 🇪🇸
- id: mouse
  translation:  
    one: Ratón
	other: Ratones
```

```yaml
# i18n/fr.yaml 🇫🇷
- id: mouse
  translation:  
    one: Souris
```

Because the French word `Souris` is the same in both its singular and plural form, we just need that `one` plural tag.

The template function `i18n` takes a second parameter, an `int`, which will let Hugo know how many items your string is referring to and pluralize it if needed. 



```go-html-template
{{ range .Pages }}
	<h3>{{ $.Title }}</h3>
	{{ with .Params.mice }}
		This story has {{ . }} {{ i18n "mouse" . }}.
	{{ end }}
	<hr>
{{ end }}
```

Considering we have 2 stories, the first one with 24 Mice and the second one with only one, this is how our HTML would compile:

```html
<h3>Cinderella</h3>
This story has 24 Mice.
<hr>
<h3>Fantasia</h3>
This story has 1 Mouse.
<hr>
```

### Including the number in the translation

You can even include the number right in your translated string using `.Count`: (Mind the double quotes)

```html
- id: mouse
  translation:
    other: "{{ .Count }} Mice"
    one: only one Mouse
```

From now on, as the number of mice will be included in the `i18n` returned output, we can drop its mention from our code:

<del>`This story has {{ . }} {{ i18n "mouse" . }}`</del>
`This story has {{ i18n "mouse" . }}`

Our new compiled HTML would now output:

```html
<h3>Cinderella</h3>
This story has 24 Mice.
<hr>
<h3>Fantasia</h3>
This story has only one Mouse.
<hr>
```

{{% notice type="warning" %}}
Thinking about _This story has no Mouse_ when the number is `0`? 
As [explained further down](#hugo-filesystem-and-string-localization), it's a no go 🙅‍♂️.
{{% /notice %}}
### Including a context in the translation

Instead of an `int` you can also pass a context as a second argument to `i18n`. 

It kind of works like the `partial` argument, but bear in mind the following while doing it:

1. `i18n` won’t be able to evaluate the argument as a number (because it’s not), so forget pluralizing this string with `one` and `other`.
2. If calling this string in more than one place, you should make sure to always pass the same context (the page or otherwise) because if the key called from within your `i18n` file does not exist, you will end up with an ugly `can't evaluate field` error.

### Hugo filesystem and string localization
Remember that your `i18n` files are part of the global Hugo filesystem. Every `en.yaml` files present in Hugo’s file hierarchy will be merged.
So if one of the translation in the theme you are using does not suit you, all you have to do is create another `i18n/en.yaml` at the root of your project (or a preeminent theme component) and include only that one translation in it.

```html
# i18n/en.yaml
- id: mouse
  translation:  
	one: Rodent
	other: Rodents
```

That's it! For the other languages, Hugo will default to `themes/cool-theme/en.yaml`'s _Souris_ and _Ratones_ 🐁.

### A final world on strings and plural tags

The english language only offers two forms of pluralization, it’s either single or plural. 

So quiet logically, in Hugo, while treating a string in english, the only available plural tags are `one` and `other`. 
The correct tag will be determined by this simple test:

__if__ `i18` integer argument __==__ `1`  👉  `one`
__else__ - - - - - - - - - - - - - - - - - - - - -  👉  `other`

That's for Enligsh!

Now some languages like Russian have a special pluralization for `few` and another for `many`[^1].

How many items does it take to reach a `few` or `many` in Russian?
I don’t know but Hugo does, thanks to [Nick Snyder](https://github.com/nicksnyder) ’s [go-i18n](https://github.com/nicksnyder/go-i18n). 

Here is the list of the supported plural tags across every languages:

- zero
- one
- two
- few
- many
- other

Again, this does not mean you can use those in english. 

If the current language is English, and you set the `zero` plural tag to `none`, you’ll only see the value of `other` even if the `i18n` second argument equals to zero. 
For the `zero` value to show, the current language would have to be Arabic or any other which supports the `zero` plural tag.

[^1]: http://www.unicode.org/cldr/charts/33/supplemental/language\_plural\_rules.html
