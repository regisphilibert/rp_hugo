---
title: "Hugo Page Resources"
date: 2018-01-09T13:03:53-05:00
lastmod: 2018-02-01T11:44:00-05:00
slug: hugo-page-resources-and-how-to-use-them
subtitle: and how to use them...
toc: true
tags:
 - Hugo
 - Resources
 - Shortcodes

description: In this article we'll cover Hugo 0.32's Page Resources and its impact on the way we structure our content folders, what methods and properties it offers, how to use it in our templates and markdown and finally its newly metadata logic!
---
Hugo 0.32 launched just before the new year and it brought along two massive improvements. __Page Resources__ and Image Processing. Then Hugo 0.33 followed closely with a __metadata__ management for the __Page Resources__

In this article we'll cover __Page Resources__ and its impact on the way we structure our content folders, what __methods__ and __properties__ it offers, how to use it in our templates and markdown and finally its newly __metadata__ logic!

## What are Page Resources?

Pages can now have their own images, files or pages stored in their own content folder or "bundle". We explain more on the directory structure below.

### Before Page Resources

1. You had to store the files you would need for one page or post in the static folder of either your theme or your hugo install. 
2. Then you had to call for this image relative url in your markdown.
3. You had to reference them in your Front Matter so your templates knew where to look.

I personnaly used to store them under a directory named after their respective Type so I could dynamically build a path in my templates.

~~~nohighlight
.
├── content
│   ├── post
│   │   ├── i-love-eating-cupcakes.md
│   │   └── i-hate-baking-cupcakes.md
│   └── page
└── static
    └── post
        ├── yummpy-cupcake.jpg
        ├── shiny-glaze.jpg
        ├── overcooked-dough.jpg
        └── sloppy-icing.jpg
~~~

### After Page Resources: Hello Page Bundles
Now since Hugo 0.32, with Resources, you have a better option.

The content folder is a bit more clustered but every images/files are stored within their post directory bundle. And their url will follow the posts' too.

~~~nohighlight
.
└── content
    ├── post
    │   ├── i-love-eating-cupcakes
    │   │   ├── index.md // That's your post content and Front Matter
    │   │   └── images
    │   │       ├── yummy-cupcake.jpg
    │   │       └── shiny-glaze.jpg
    │   └── i-hate-baking-cupcakes
    │       ├── index.md // That's your post content and Front Matter
    │       └── images
    │           ├── overcooked-dough.jpg
    │           └── sloppy-icing.jpg
    └── page
~~~

## What are their methods and properties?

### Available methods for .Resources

#### .Resources.ByType (func)

Allow to retrieve all the page resources by type.
~~~go
{{ with .Resources.ByType "image" }}
	<div class="Image">
	{{ range . }}
		<img src="{{ .RelPermalink }}">
	{{ end }}
	</div>
{{ end }}
~~~


#### .Resources.Match (func)

Introduced in 0.34 `.Match` allows you to retrieve resources by [Glob matching](https://en.wikipedia.org/wiki/Glob_(programming))
Along the lines of our example above, it would go this way.
~~~go
{{ with .Resources.Match "images/carousel/*" }}
	<div class="Carousel__slide">
	{{ range . }}
		<img src="{{ .RelPermalink }}">
	{{ end }}
	</div>
{{ end }}
~~~

##### Glob matching?
To illustrate Glob let's say you are looking for that sweet letter you got last year. Let's see which glob would find this letter for you:
~~~go
// Looking for letters/DearJohn.doc ?
.Resources.Match "letters/Dear*" ✅ 
.Resources.Match "letters/*.doc" ✅
.Resources.Match "**.doc" ✅ 
.Resources.Match "**/dearjohn.doc" 🚫
.Resources.Match "*.doc" 🚫
~~~

#### .Resources.GetMatch (func)

Same as above but will only return the first matching resource.

#### <del>ByPrefix, GetByPrefix (func)</del>
Those 2 are deprecated (yep Hugo moves fast). But if you really still have to use them. They find resources using another form of matching, understand the begining of your filename.

### Available properties for one resource.
What to do when I found it?

### .ResourceType (string)
The type of the resource.

Now, it is based on MIME type, but will only hand out the main type. So when MIME type will give you `application/pdf`, .ResourceType will only give you `application`. See the full list of existing MIME type [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types).

Then how do I make the difference between a ZIP and a PDF, both sharing the main type `application`? We'll cover this further down.

### .Name (string)
By default this is the base filename (including the extension).
It can be overriden with the resource's Front Matter metadata.

### .Title (string)
Same default as .Name except for Resource of type page you can expect it to return their .Title.
For resources other than pages, it can be overriden with Resources Metadada covered below.

### .Permalink (string)
The absolute URL of the resource.

### .RelPermalink (string)
The relative URL of the resource.

## How to use them?

Now. How can it benefit my coding? 

### In my templates?
Well from your template you can now easily retrieve the resources bundled with a post to say create a gallery in your single.html:

~~~go
{{ with .Resources.ByType "image" }}
	<div class="Gallery">
		{{ range . }}
			<div class='Gallery__item'>
				<img src="{{ .RelPermalink }}" />
			</div>
		{{ end }}
	</div>
{{ end }}

~~~

Now all you will have to do is drop your images in the post bundle directory and _voilà_!

Metadata offer a simpler way, which we will cover later.

### In my markdown?

You can also create a __shortcode__ which will retrieve a particuliar resource by its matching filename.

~~~go
//shortcodes/img.html
{{ $img := $.Page.Resources.GetMatch (.Get 0)}}
<figure>
	<img src="{{ $img.RelPermalink }}" alt="(.Get 1)" />
	<figcaption>(.Get 1)</figcaption>
</figure>
~~~

And in your markdown:

~~~Markdown
{{</* img "*overcooked-dough*" "Those cupcakes are way overcooked!" */>}}
~~~

This is a pretty simple shortcode we'll get deeper into the possibilites in another article.

## Any kind of files

You can use any file type, but knowing what you're dealing with is important. Trying to retrieve .Width of a PDF will result in an error.

Because `.ResourceType` will only give you the main type of your file, if you need to know if this resource of type application is a ZIP or a PDF file, for now, you'll need to use `strings.Contains` on `.RelPermalink`  as illustrated below[^1].

~~~go
{{ with .Resources.ByType "application" }}
	<ul>
	{{ range . }}
		<li>
			<a href="{{ .RelPermalink }}">
				{{ if (strings.Contains .RelPermalink ".pdf") }}
					Check out this PDF!
				{{ else if (or (strings.Contains .RelPermalink ".doc") (strings.Contains .RelPermalink ".docx")) }}
					Check out this Word Document!
				{{ else }}
					Check out this... Thing!
				{{ end }}
			</a>
		</li>
	{{ end }}
	</ul>
{{ end }}
~~~

Or you could just use Page Resources Metadata which leads us to...

## Page Resources Metadata

[@bep](https://github.com/bep) has worked hard so we can manage metadata for our resources[^2].

Since Hugo 0.33, you can assign metadata directly from the bundle's index.md Front Matter.
You will add an array called `resources`

This is how it looks like in the front matter. Those * in the src param look familiar? More below.

~~~yaml
resources:
- src: "*/yummy-cupcake.jpg"
  title: "Yummy Cupcake"
  name: cupcake-1
- src: "*/shiny-cupcake.jpg"
  title: "Shiny Glaze"
- src: "*/*.jpg"
  params: 
    credits: Myself the cook!
~~~

### Target one or multiple files using `src`

Each item is targeted by its `src` parameter. 

The `src` parameter will use the name of the file relative to the bundle to target which resource this metadata belongs to. Along the .Match Globbing mechanism, you can use the `*` to build that src.

Trying to match images/yummy-cupcakes.jpg: 

~~~yaml
src: 'images/yummy-cupcake.jpg' ✅
src: '*/yummy-cupcake.jpg'      ✅
src: 'images/*.jpg' 			✅
src: 'images/*-cupcake.jpg' 	✅
src: '*.jpg' 					✅

src: 'yummy-cupcake.jpg' 		🚫
src: 'yummy-cupcake' 			🚫
~~~

From our Front Matter exemple above we can see that yummy-cupcake.jpg and shiny-cupcake.jpg are getting respective titles.
On the other hand, every jpg images in the bundle including our two cupcakes will have a custom param `credits`

### Metadata parameters

`src` is not really a parameter, you got that.

#### name

Name is the name of your file. This doesn't seem much but it is very important. 

I write it in lowercase, for this is the way in you Front Matter but you should really see it as `.Name`.

We already reviewed its [default](#name-string), now you can overwrite it.

Now remember those functions .Match and .ByMatch ? This is what they use, the `.Name`. So once we apply a custom `name` to yummy-cupcake.jpg, you will have to .Match this new name and not the filename. In our case, trying to match yummy-cupcake.jpg:
```
{{ .Resources.Match "*/yummy-*" }} 🚫
{{ .Resources.Match "*/cupcake-*" }} ✅
```

Using Front Matter resources metadata we changed the name of yummy-cupcake, it is now called `cupcake-1` and will only respond when called by its new name even by `.Match`.

This may seem weird but it is actually very useful. If youre image filename end up being some very complicated hash, you may simplify their targeting by specifying a name in the front matter and use .Match on that.

#### title 
More like .Title, it holds the same default value as name, now you can overwrite it. This time, it won't break anything.

#### params

This is an object for you to store anything you want, like for Page params, you retrieve them like so:

~~~go
{{ range .Resources.Match "**.jpg" }}
<figure class="Figure">
	<img src="{{ .Permalink }}" alt="{{ .Title }}">
	{{ with .Params.credits }}
	<div class="Credits">
		{{ . }}
	</div>
	{{ end }}
</figure>
~~~

### More on metadata.
Obviously there are plenty use cases for them. Already I can think of adding a draft param to some files I want to exclude from a particular range.

~~~go
{{ if not (.Params.draft) }} // Check that the Resource is not marked as draft
~~~

Another use case is the building of a manifest shortcode to list certain files from your bundle right in your content.

### Adding a Page Resources Manifest using metadata

Let's try and build a page that lists important PDF to print, fill and send for like a bogus application.

First we create a page.
~~~markdown
---
title: "Bogus Application"
date: 2018-01-10
---

Hey there! Welcome to a bogus application! 

::FILE LIST WILL GO HERE::

Thanks!
~~~


After adding the files, our page bundle structure should look like this

~~~nohighlight
bogus-application
├── index.md
└── documents (grouping them in a dir is optional)
    ├── guide.pdf
    ├── checklist.pdf
    ├── photo_specs.pdf
    └── payment.docx
~~~


Then we add some resources metadata to the Front Matter

~~~yaml
---
title: "Bogus Application"
date: 2018-01-10T10:36:47-05:00

resources:
- src: 'documents/guide.pdf'
  name: Instruction Guide
  params:
    ref: '90564568'
- src: 'documents/checklist.pdf'
  name: Document Checklist
  params:
    ref: '90564572'
- src: photo_specs.pdf
  name: Photo Specifications
  params:
    ref: '90564687'
- src: 'documents/payment.docx'
  name: Proof of Payment
# Now our shared values
- src: '*.pdf'
  params:
    icon: pdf
- src: '*.docx'
  params:
    icon: word
~~~

Then we create a shortcode so we can add the file list anywhere in your content.

All its needs to do is to `range` on the resources stored in the document directory.

~~~go
// shortcodes/manifest.html
<ul>
	{{ range .Resources.Match "documents/*" }}
	<li>
		<a target="_blank" href="{{ .Permalink }}">
			<i class="far fa-file-{{ .Params.icon }}"></i> {{ .Title }} <small>{{ with .Params.ref }}(Ref.{{ . }}) {{ end }}</small>
		</a>
	</li>
	{{ end }}
</ul>
~~~


And voilà! The result is [here]({{< ref "bogus/application/index.md" >}})

We could improve the shortcode with some parameters, but for the sake of this article, we'll keep it simple.

Now all you have to do is drop the shortcode in the page.

~~~Markdown
---
title: "Bogus Application"
date: 2018-01-10T10:36:47-05:00
draft: true
---

Hey there! Welcome to a bogus application! 

{{</* manifest */>}}

Thanks!

~~~

## Page bundle for the home page
The home page is usually the most complex page of your website and hosts a plethora of little gizmoz: carousels, quotes, sections, all of them great use cases for Page Resources.

Unfortunately and quiet logically there is no Page Bundle implementation for the home page yet.

But with Hugo 0.35 new [headless feature](https://github.com/gohugoio/hugo/commit/0432c64dd22e4610302162678bb93661ba68d758) we can imagine doing something pretty simple to manage that.

We create a new page bundle called `home` at the root of our content directory and set the headless parameter to true in its Front Matter. 

~~~yaml
# content/home/index.md
title: "Home Bundle"
date: 2018-01-10
headless: true
~~~
This way the page will not be rendered by Hugo but will answer to a simple `.GetPage` so accessing its resources from the `index.html` template is as easy as that:

```go
{{ $home := (.GetPage "page" "home").Resources }}
<div class="Carousel">
	{{ range $home.Resources.Match "carousel/*" }}
	[ ... ]
	{{ end }}
</div>

```

## Conclusion

Page Resouces is still an early feature in the Hugo universe and is bound to improve. 

Since I first published the article __.Resources.Match__ and __metadata__ have landed! Think of what's coming ahead at this pace!

### Use cases
There's plenty of use case to think about.

Of course a __gallery__ comes to mind or a __carousel__, using the Front Matter metadata techniques for adding an image description or a carousel slide text and title.

Another use case could be a solution to store your post's __revisions__ directly in the Page Bundle and reference them using `.Match "revision-*"`. 
Every mardownfile could be very easily listed a the bottom of your post as a reference to its past version. It wouldn't have its own standalone page, but with an accordeon you could have them handy for your editors.

Feel free to suggest improvements, use cases or your own discoveries in the comments! 

## Before you go: manifest.json alternative

An alternative if you happen to have hundreds of file to go through would be to dynamicaly create a manifest.json to be added to the Page Bundle and use it as a resource.

To do this though, you will have to target a manifest file included in the bundle instead of the Front Matter metadata

~~~go
// We store the page resources for future use form inside the range / with.
{{ $resources := $.Page.Resources }}

{{ with $.Page.Resources.GetMatch "*manifest.json" }}
~~~

We got our json, inside of it sits an array of all your referenced resources. They have their own parameters plus a very important __match__ key. This key will help us retrieve the .Resource object using .GetMatch, so I suggest a unique filename.

Now we need to read our json's data. 

`{{ $manifest := getJSON .Permalink }}` is tempting but we can't rely on `.Permalink` or `.RelPermalink` because it may very well be not available on your first publish.

We need to target its path straight from the `content` folder

The resource holds `.AbsSourceFilename` which is the absolute path, but in order to use Hugos's `getJSON` on it, we need its relative path to the hugo install.

~~~go
// ... inside {{ with }}
{{ $AbsPath := strings.Split .AbsSourceFilename "/content/" }}
{{ $RelPath := printf "/content/%s" (index $AbsPath 1) }}

// We are finally able to get the json with its relative path. 
// It doesn't matter if it has already been published or not.
{{ $manifest := getJSON $RelPath }}
~~~

Then all you have to do, is use the same range code as in the Front Matter exemple. Or you could add a parameter to the shortcode to choose the Front Matter way or the json way. Up to you.

~~~go
<ul>
	{{ range $manifest }}
	{{ $resource := $resources.GetMatch .prefix }}
	<li>
		<a target="_blank" href="{{ $resource.Permalink }}">
			<i class="far fa-file-{{ .type }}"></i> {{ .name }} <small>{{ with .ref }}(Ref.{{ . }}) {{ end }}</small>
		</a>
	</li>
	{{ end }}
</ul>

// We started with a with, let's close it.
{{ end }}
~~~



[^1]: Special thanks to [@bep](https://github.com/bep) for being patient with my pestering in the [Hugo Discource](https://discourse.gohugo.io/) and giving the `strings.Contains` and his amazing work on improving the already impressive Hugo.

[^2]: As of Hugo 0.34