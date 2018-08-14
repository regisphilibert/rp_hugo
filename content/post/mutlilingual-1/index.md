---
title: "Hugo Multilingual Part 1: Content translation"
date: 2018-08-10T11:24:56-04:00
slug: hugo-multilingual-part-1-managing-content-translation
toc: true
twitter_card: summary_large_image
description: "Hugo handles multilingual perfectly from you content translation to your string localization. In this first part, we’ll see how set up your multilingual Hugo project and translate your content."
---

Hugo handles multilingual perfectly from you content translation to your string localization, everything is simplified so coders and editors alike can focus on the rest.

In this first part, we’ll see how set up your multilingual Hugo project and translate your content!

 <!--more-->

## Configuring our languages

When undertaking a multilingual project in Hugo, the first thing to do would be to tell Hugo what our supported languages are. For this project, we’ll have three:

1. English 🇬🇧
2. French 🇫🇷
3. Spanish 🇪🇸

So we add the following params to our config file.

```yaml
# config.yaml
languages:
  en:
	languageName: English
	weight: 1
  fr:
	languageName: Français
	weight: 2
  es:
	languageName: Spanish
	weight: 3
```

Now, our languages will be available using `.Site.Languages` and sorted by `Weight`. The lower the… firster.

Any custom parameter will be used when calling `.Site.Params` or `.Param` in place of the default site parameter. Se we never have to worry about which parameter to call!

```yaml
# config.yaml
params:
	description: Everything you need to know about the three languages.
	twitter_handle: 3Languages

languages:
  en:
	languageName: English
	weight: 1
  fr:
	languageName: Français
	weight: 2
	description: Tous ce que vous avez toujours voulu savoir sur les trois langues.
	twitter_handle: 3Languages_france
  es:
	languageName: Spanish
	weight: 3
	description: Todo lo que necesitas saber sobre los tres idiomas.
	twitter_handle: 3Languages_espana

```

```go-html-template
<meta name="description" content="{{ .Param "description" }}">
<meta name="twitter:site" content="{{ .Param "twitter_handle" }}">
```

## Translating our pages
To manage your translated content, Hugo offers two different ways. 
The first one implies including the language code in your content file’s as such: `/content/about.fr.md`.
The second one implies creating your file inside a dedicated content directory as such: `/content/french/about.md`

We’ll take a deeper look at how each ways ensure two things :

1. Each page is assigned a language.
2. Each page is linked to its respective translations.

### Managing translations by Filename 📄
Let’s take a look at our about page, and its translations.

```
content
	├── about.md
	├── about.es.md
	└── about.fr.md
```

Hugo will assign the French language to `about.fr.md` and the Spanish one to `about.es.md` . Easy guess! 

Now what about `about.md`? Well this one, because it lacks any language code will be assigned the default language. 

If `DefaultContentLanguage` is not set in your configuration file, the default language will always be English. So for example, if we needed Hugo to assign Spanish to `about.md`, we would have to make this language the default one by adding this line:
```yaml
# config.yaml
DefaultContentLanguage: es
```

### Managing translations by Directory 📁
It is also possible to assign a different content directory to each of your languages. In order to use this system we would have to include a `contentDir` parameter to our languages configuration.

```yaml
languages:
  en:
	languageName: English
	weight: 1
	contentDir: content/english
  fr:
	languageName: Français
	weight: 2
	contentDir: content/french
  es:
	languageName: Spanish
	weight: 3
	contentDir: content/spanish
```

The parameter takes a relative path to your project, or an absolute path. Using an absolute path means the content directories don’t necessarily need to live inside your project, they can be anywhere on your computer.

Going back to our about pages, this is how our content directories would look like:
```
content
    ├── english
    │   └── about.md
	├── french
	│   └── about.md
	└── spanish
	    └── about.md
```

Now, Hugo will assign a language to each of the about pages by looking at which directory they live in.

## Linking our pages 🔗

Translation linking is important.

We usually want to advertise the available translations of a page to our users be it in the form of a language switch menu or some SEO meta tags.

We’ve seen how Hugo assign a language to a particular page, but how will it be able to link pages as translations of each other?

For both systems, Hugo will look at the filename and its location relative to its content directory. So depending on your translation management system, we can check those linkings:

{{% fullwidth %}}
 By Filename | | 
:---|---|---
`content/about.md`|`content/about.fr.md`| ✅
`content/about.fr.md`|`content/about.es.md`|✅
`content/about/index.md`| `content/about/index.fr.md` |✅
`content/about.md`|`content/a-propos.fr.md`|🚫
`content/company/about.md`|`content/about.fr.md`|🚫
{{%/ fullwidth %}}

{{% fullwidth %}}
By Placement | | 
:---|---|---
`content/english/about.md`|`content/french/about.md`|✅
`content/english/about/index.md`|`content/french/about/index.md`|✅
`content/english/about.md`|`content/french/a-propos.md`|🚫
`content/english/company/about.md`|`content/english/about.md`|🚫
{{%/ fullwidth %}}

Note that you can force a linking even if default linking factors don’t match.
All you’d have to do is add to your pages a `translationKey` Front Matter param which share the same value. 
```markdown
# From all three pages: about.md, a-propos.fr.md, acerda.es.md
---
translationKey: about
---
```
Now, even though their names won’t match, Hugo will gladly link those pages for you.


### Using linked translations in your template.

Now, how can we benefit from this linking in our template?

Hugo stores the linked translations in two Page variables:

* `.Translations`, the linked pages.
* `.AllTranslations`, the linked pages including the current one. 

The collections are sorted by language `Weight` as defined in our configuration file.

So in order to build our alternate meta tags, we would just add this in our `<head>`:
```go-html-template
{{ if .IsTranslated }}
	{{ range .Translations }}
	<link rel="alternate" hreflang="{{ .Language.Lang }}" href="{{ .Permalink }}" title="{{ .Language.LanguageName }}">
	{{ end }}
{{ end }}
```

Some may argue the current translation should also be added as an alternate, in this case, we could use `.AllTranslations`.

This also works perfectly to build a language menu which will only show up if one or more translations are available.
```go-html-template
{{ if .IsTranslated }}
	<nav class="LangNav">
	{{ range .Translations }}
		<a href="{{ .Permalink }}">{{ .Language.LanguageName }}</a>
	{{ end}}
	</nav>
{{ end }}
```

{{< notice >}}
The `.Language` object is available on every pages. Alongside the main language parameters it holds the custom ones assigned in your language configuration object, here our description and twitter handle.
{{< /notice >}}
## Page Bundles

Not only does Hugo make it possible to share resources among translations, it also lets you localize a resource!

Let’s go back to our about pages and turn them into Bundles. For clarity we’ll use the "_By Directory_" management system.

```
content
    ├── english
    │   └── about
    │       ├── index.md
	│		└── header.jpg
	├── spanish
	│	└── about
	│		└── index.md
	└── french
	    └── about
	        └── index.md
```


```
content
    ├── english
    │   └── about
    │       ├── index.md
	│		└── header.jpg
	├── spanish
	│	└── about
	│		└── index.md
	└── french
	    └── about
	        └── index.md
```

For now, every pages share the same `header.jpg`, the one in the English translation. This has nothing to do with it being the default language though.  
 
Hugo help save on duplicates here by making any ressource available to every linked translations. Meaning we can access this header image regardless of the current language using our favorite `.Resources` method, say `.Resources.GetMatch "headers.jpg"`

This is very convenient.
But what if we want a header image better aligned with our Spanish audience.
How to add a dedicated `header.jpg` for the Spanish page?   
  
By doing exactly that!

```
content
    ├── english
    │   └── about
    │       ├── index.md
	│		└── header.jpg
	├── spanish
	│   └── about
	│       ├── index.md
	│		└── header.jpg ✨
	└── french
		└── about
			└── index.md
```

That’s it, when building the Spanish translation of the about page our `.Resources` method will return the Spanish bundle’s very own `header.jpg`.

Now what about the French? 
There is no `header.jpg` in that bundle, so which header will be returned for the french translation? The Spanish one? The English one?

Well here, Hugo will look at the languages respective `Weight` and return the winners’s file. If we look at our initial configuration file, the French should get the English header.

You should know that any file, content or not, can be renamed to match a language. For this Page Bundle localization, we chose to manage our translations by __content directory__ but had we chosen to manage them by __filename__, this is how our About page's Bundle would have looked like:
```
content
	└── about
		├── index.md
		├── index.es.md
		├── index.fr.md
		├── header.jpg
		└── header.es.jpg
```
{{< notice >}}
Because `.GetMatch` tests on a Resource’s `.Title` which defaults to its filename (language included), always try, with a _By Filemane_ bundle, to make your resource call _language-agnostic_, like so: `.Resources.GetMatch "header*.jpg"`
{{< /notice >}}
## Setting our URLs
What about your pages’s URLs ? We already mentioned how you can overwrite the slug from the Front Matter but what about the root url of your languages?

By default, Hugo will store your default language pages at the root of your `public` directory and the other languages’ pages below their respective directories.

So quiet logically our About pages would en up at:

- `about/index.html` 🇬🇧
- `fr/about/index.html` 🇫🇷
- `es/about/index.html` 🇪🇸

We could have the default language also live below a directory though by simply setting `defaultContentLanguageInSubdir`to `true` in our `config.yaml`


## Conclusion
We covered the different ways you could manage the translation of your content in Hugo. Next week, we’ll see how easy it is, once you’ve translated your page, to do the same with your theme’s strings! In other words.

__From__
```html
<a href="/about/" title="About Us">Read more!</a>
```
__To__
```html
<a href="/a-propos/" title="À propos">En savoir plus!</a>
```

