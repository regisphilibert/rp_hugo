---
title: "From Hugo to WordPress, a mindset transition"
slug: from-wordpress-to-hugo-a-mindset-transition
date: 2019-01-02T13:44:20-05:00
draft: true
toc: true
tags:
 - Hugo
 - WordPress
twitter_words: When trying to transition to @GoHugoIO from $WordPress, developers may find ourselves encumbered by the later's logic and concept. In this post, we'll deal with migrating not your website, but your mindset from WordPress' to Hugo's. $JAMStack $SSG"

description: This post is not about migrating your WordPress site to Hugo, it’s about transitioning from your WordPress mindset to Hugo’s so you can quickly grasp this new environment.
---

This post is not about migrating your WordPress site to Hugo, it’s about transitioning from your WordPress mindset to Hugo’s so you can quickly grasp this new environment by cautiously comparing its concept and vocabulary to one you’re already familiar with.

So let’s bring up the `the_post()`, `the_loop`, the `functions.php` , and the Template Hierarchy, in order to better understand Hugo’s own concepts!


## From WordPress to Hugo

As WordPress makes 80% of the web these days, it’s a fair assumption that many readers are familiar if not experts of that very famous CMS.
It is also what I came from, my previous major if you will, before I got hooked up on Hugo.

And for a long time, I was stuck in its logic. Discovering Hugo, I constantly tried to juxtapose its vocabulary and concepts with WordPress’ own.

I soon realized this systematic comparison was a bad idea. Hugo’s own lexicon and logic are unique and very different from WordPress. 
But it stroke me that a more cautious comparison could have helped me learned Hugo faster and without too many costly errors along the way.

So if you’re starting your Hugo journey and know your way around WordPress, you should benefit from reading what follows.

## Everything is a Page

This blunt affirmation is quintessential to further understand the concept of Hugo, especially when it comes to template logic. 

Hugo sees a page as a markup file being compiled and added to your public directory. In this sense, a post, a page, a list of posts, a list of taxonomy terms, those are pages.
Think of it this way, if it has a permalink, it’s a page!
If everything is a page for Hugo, there are comprehensible distinctions to make, among them are Types and Kind.

### Type 

In a framework like WordPress, every entry is a __post__ of different types. A post is a post of type `post`, a page is a post of type `page` and a recipe is a post of custom post type, `recipe` (or whatever you chose to name it).

In Hugo, every entry or content file is a regular __page__ of a different type. And because there is no built-in type, every type is your own custom type. The way you create a page of a certain type is
1. Add the Front Matter `type` and set it to that desired type.
2. Or most often, let the first level directory of the content file decide of its type.

To create a page of type recipe:

```Markdown
title: Delicious Cupcake
type: recipe
---
```

Or let the directory structure work its magic:

```
content
  ├── post
  └── recipe
      └── delicious-cupcake.md
```


### Kind
In WordPress we can differentiate layouts with the templates.

The landing page for your post entries being built from `archive.php`, we call it an Archive, while the landing page for your single post entry being built from `single.php`, we call it a Single.

Hence the following boolean function `is_single()`, `is_archive()`! They’re very convenient to change some pieces of code lodged inside common `includes`.

In Hugo, again, everything is a page. And to determine what they’re supposed to show, we use the word Kind.

Here are the different page Kinds in Hugo:

- The landing page for your website is a page of kind `homepage`
- The landing page for all your recipes is a page of kind `section`
- The landing page for your recipes categorized as chocolate is a page of kind `taxonomy`
- The landing page for all your recipes’ categories is a page of kind `taxonomyTerm`
- Finally the landing page for that one recipe is a page of kind `page`

## Template and Hierarchy

Now that we covered Types and Kind, we can dive into Hugo’s Template Logic.

 Everything dropped in the `layouts` directory will be subject to Hugo’s own [Template Hierarchy](https://gohugo.io/templates/lookup-order/) or in Hugo terms Template Lookup. 

In addition to using filenames, Hugo also uses directory structure to choose the right template files.
NOTE:
As mentioned above, while WordPress expect `archive.php` to template the landing page for your blog posts’ list. Hugo expects `list.html` to fill this role.

Many parameters, including Kind, Type, Output Format, Language, Taxonomy term, can help determine which template will be used for a given page.


### Custom Page Templates

It’s one of the most archaic WordPress [stuff](https://developer.wordpress.org/themes/template-files-section/page-template-files/#creating-custom-page-templates-for-global-use). 

If you want your editor to manually choose a layout for a given page, you have to create a template file, put it anywhere in your theme directory and include this ugly scribble:
```
<?php /* Template Name: Custom 🤮 */ ?>
```

With Hugo, you can assign any content file a custom layout with a single Front Matter param, `layout`.

Then just drop the file in your `layouts/_default` and your good!

### Template file comparison
Here is too small a corresponding table:

 WordPress | Hugo 
 :------------- | :------------- 
`single.php`| `layouts/_default/single.html`
`archive.php`| `layouts/_default/list.html`
`single.php`| `layouts/_default/single.html`
`single-recipe.php`| `layouts/recipe/single.html`
`archive-recipe.php`| `layouts/recipe/list.html`
`contact.php`| `layouts/_defaults/contact.html`


### Includes

Good practice in WordPress is to use `get_template_parts` to include a file from your theme.
It will inherit the globals defined by WordPress core (`$post`, `$wp_query`, etc…) .

In Hugo we talk about Partials. Those are files stored in `layouts/partials` which will be loaded using the `partial` function.

The catch here is that this needs a [scope or context](https://regisphilibert.com/blog/2018/02/hugo-the-scope-the-context-and-the-dot/) to be passed as parameter. By default, nothing from your page will be passed to this « included » partial.

## Post Data or Page Variables

In WordPress, every post data is made available from he template files through some functions or methods `the_permalink()`, 
`the_title()`, `the_content()`, `the_date()` etc… 

Hugo on the other hand gives you an object of [variables and methods](https://gohugo.io/variables/page/#readout) referred to as the Page Context and stored in a dot. Yes a dot.
So, translating the above WordPress to Hugo you get `.Permalink`,  `.Title` , `.Content`, `.Date`.

### The Loop with `range`

Browsing through posts in order to build your archive pages or a Recent Post widget is essential in any template engine!

Depending on which template you are, WordPress will always give you an array of « posts » to loop through, even if this is only the one post to show in your single page.

So wether you’re on the template file for the archive of blog posts or the template file for the archive of recipes of the chocolate category, you get those posts or recipes in your Loop, paginated.

In Hugo, when in list template, pages in that list are available through `.Pages`.

So if you’re on a list template for a section (`/posts/`), `.Pages` will return the pages included in such section.
If you’re on a taxonomy archive (scratch that, list) page, you’ll get the pages belonging to it, plus this taxonomy information in `.Data`.

With Hugo though, when on a single page, `.Pages` will be empty (duh) as all the information you need is right there in the root context `.`.

### Loop comparison by example

This is our beloved WordPress loop

```php
// theme/archive.php
<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
  <!-- post -->
  <h2>
    <a href="<?php the_permalink(); ?>"><?php the_title() ?></a>
  </h2>
  <h6><?php the_date(); ?></h6>
  <p>
    <?php the_excerpt(); ?>
  </p>
  <hr>
<?php endwhile; ?>
<?php else: ?>
<!-- no posts found -->
<?php endif; ?>
```

Converted into beautiful Hugo

```go-html-template
//layouts/_default/list.html
{{ with .Pages }}
  {{ range . }}
    <h2>
      <a href="{{ .Permalink }}">{{ .Title }}</a>
    </h2>
    <h6>{{ .Date.Format "January, 02 2006" }}</h6>
    <p>
      {{ .Summary }}
    </p>
    <hr>
  {{ end }}
{{ else }}
<!-- no posts found -->
{{ end }}
```

This is a more advanced query in WordPress for building a Recent Recipe Widget ordered by a custom parameter:

```php
<?php  
$recents = new WP_Query(
  [
    'post_type'=>'recipe',
    'posts_per_page'=>5,
    'orderby'   => 'meta_value_num',
    'meta_key'  => 'rating',
  ]
);
 if ( $recents->have_posts() ) : while ( $recents->have_posts() ) : $recents->the_post(); ?>
  <h2>
    <a href="<?php the_permalink(); ?>"><?php the_title() ?></a>
  </h2>
<!-- post -->
<?php endwhile; ?>
<?php else: ?>
<!-- no posts found -->
<?php endif; ?>
?>
```

Let’s see its Hugo variant:

```go-html-template
{{ range first 5 (where .Site.RegularPages "Type" "recipe").ByParam "rating" }}
  <h2>
    <a href="{{ .Permalink }}">{{ .Title }}</a>
  </h2>
{{ end }}
```

For more details on how to filter and order collections of Pages in Hugo, you’ll need to read about [range](https://gohugo.io/templates/introduction/#example-1-using-context), [where](https://gohugo.io/functions/where/#readout), and [ordering](https://gohugo.io/templates/lists/#order-content).

## Shortcodes
In WordPress, shortcodes are « output returning » functions managed adding several `add_shortcode` to your `functions.php` 

Hugo also sports [shortcodes](https://gohugo.io/templates/shortcode-templates/), and those are created by adding particular template file under `layouts/shortcodes/`. 
You retrieve its content with `.Inner` and its parameters with `.Get`!  
Contrary to WordPress those don’t necessarily have to be named (`.Get "title"`), they can also be [positional](#) (`.Get 0`).

### Shortcode comparison by example

This is a WordPress shortcode example from the doc[^1]

[^1]: [WordPress Shortcode API](https://codex.wordpress.org/Shortcode_API#Enclosing_vs_self-closing_shortcodes) containing shortcode example.

```php
<?php 

function caption_shortcode( $atts, $content = null ) {
  $a = shortcode_atts( array(
    'class' => 'caption',
  ), $atts );

  return '<span class="' . esc_attr($a['class']) . '">' . $content . '</span>';
}
```

In your WYSIWG:

```html
[caption class="headline"]My Caption[/caption]
```

With Hugo:

```go-html-template
{{/* In shortcodes/caption.html */}}
<span class="{{ default "caption" (.Get "class") }}">{{ .Inner }}</span>
```

In your markdown file:

~~~Markdown
{{%/* caption */%}}My Caption{{%/* /caption */%}}
~~~

## Output formats
What’s that ? 

Exactly, WordPress certainly did not introduce you to those.

Let’s say for every page you have an HTML file at `that-page/index.html`, that’s a given. With Hugo you can make sure every page also has a JSON version as well  as an AMP version at `that-page/index.json` and `that-page/index.amp.html` respectively. 

All you have to do to make this happen is configure Hugo to add such formats to the desired pages and add the corresponding template files.

I strongly suggest your read the doc on [Output Formats](https://gohugo.io/templates/output-formats#readout) for, thanks to those, you’ll be able to add an API layer to your site, or a `.ics` file to your events very easily.

You can already use the theme components.

This little [theme component](#) by yours truly add a REST API layer to your Hugo project and has very few files involves.

## Image Processing
WordPress default image processing happens once, on upload! It later stores all newly created size formats of the media alongside the original file. When calling your image, no matter which function, you will use an argument to fetch the right size variation.

Hugo on the other hand [processes](https://gohugo.io/content-management/image-processing/#image-processing-methods) those when you need them, meaning you will only get this thumbnail version of this post header if you called for `.Fit` or `.Resize` on in your template.

There are two ways to process images. Either by using [Page Resources](https://gohugo.io/content-management/page-resources/) for which you can peruse this [post](https://regisphilibert.com/blog/2018/01/hugo-page-resources-and-how-to-use-them/) by yours truly.
Or by using Hugo Pipes for which, there is also a [post](https://regisphilibert.com/blog/2018/07/hugo-pipes-and-asset-processing-pipeline/) available.

## Themes and Plugins VS Theme Components
 
WordPress uses themes and plugins extensively and sometime for exchangeable purposes in order for you to skin your sites and add functionalities with the minimum code work.

Regarding themes, WordPress only gives you two layers of customization. 
You can create a parent theme, and put many generic stuff in there. And then create a child theme which will, for every homonymous files shared with its parent, conveniently override those.

If you need another layer of customization on top of those two, like a set of shortcodes or an AMP Output Format, you’ll have to use plugins.

In Hugo, you won’t talk about Plugins and Themes but rather of Components. 
You can add as many of those as you want. Homonymous files overriding (templates, assets, data) logic will follow your defined order of precedence. 

Some components may be full fledge themes with many template files, some may only be a small variation of your main theme adding its own set of custom templates. Some other components may only add a few shortcode definitions or an extra Output Format.

### Themeing by example

Let’s use an imaginary project for a dental clinic, where one does not want to meddle too much with code. What you need is:
A main health oriented Theme
A dental oriented extension of the main theme
A season skinning extension of the main theme 🎄
A solution to build rich mega menus
A set of medical shortcodes to be used by editors
A JSON for each « single » page.

In a WordPress environment you would need:

- Themes
  - Health Theme
  - Health Theme Dental Extension
- Plugins
  - Health Theme Season Plugin
  - Mega Menu Plugin
  - Medical Shortcodes Plugin
  - REST API Plugin

Note that if, on top of this, you want to create your own template file to override the Parent theme’s and the Child theme’s… well as far as I know, you cannot.

In Hugo, you’ll drop those directories in your `themes` directory and assign them to you project from the `config.yaml` file.

```yaml
theme:
  - health-theme
  - health-theme-dental-extension
  - heatth-theme-season-extension
  - mega-menu-component
  - medical-shortcodes-component
  - json-api-component

output:
  page:
    - html
    - json
```

The above declares the theme components along with their order of precedence and make sure the JSON output format is added to the pages of kind `page` alongside HTML.

That’s it. If you need to override any of the theme component’s files, you can do so (whaaat?) by placing this template file in the `layouts` directory at the root of your project! 

## Multilingual

Bye bye WPML! 🥳

Hugo handles [Multilingual](https://gohugo.io/content-management/multilingual/#readout) on its own and out of the box, including `i18n` string localization.

This [post]({{< ref "multilingual-series/part-1" >}}) and its [follow up]({{< ref "multilingual-series/part-2" >}}) get deep into Hugo Multilingual!

## Are we going to talk about CMS UI?

Yes! 

As you know it’s not happening out of the box with Hugo. But there are tons of solutions out there including the amazing [Forestry.io](https://forestry.io) which lets you hook a beautiful and customizable CMS UI on top of your project's repo!

Believe me, any of those are so much faster and better designed than the good old Dashboard.

## Other random features of notes
### Menus

Wordpress Menus are super powerful but are not this easy to control. Their output is managed through a walker function which is not easy to read/understand when diving into multilevel menus. 

Hugo [menu solution](https://gohugo.io/content-management/menus/#readout) lets you assign any page to a menu as well as any external url.

Contrary to WordPress there is no concept of `menu_location`. You call your menu object from wherever from the template using `.Site.Menus.mymenu`.

### Custom Fields

Hugo takes any Front Matter parameters not reserved and store them in your page object under the `Params` object.

So from your template, instead of [ACF](https://www.advancedcustomfields.com/)’s `get_field('subtitle')`, you’ll use `.Params.subtitle`

### Comments
I doubt many of you still uses WordPress’ built-in comments in 2019… But, chances are you still need some form of discussion on your posts.

As a Static Site Generator, Hugo produces static markup, so you’ll have to turn to a tier to handle your comments. 

Luckily there is a Hugo built-in `disqus` implementation you can use out of the box.

And if Discus does not cut it for you, there are many other comment solutions out there which often only require a simple script tag + matching markup.

### Related Content
Producing « You might also like » suggestions in WordPress relies solely on external plugins or your own customized post query.

Hugo does it all by itself, and like a champ, using its built-in and highly configurable [Related Content feature](https://gohugo.io/content-management/related/#readout).


## Conclusion
This article is not set in stone, a lot of things will evolve in Hugo, and so many of the comparisons written above may lose part of their sense. 

Hopefully by using a long entrenched and rarely questioned WordPress mindset, we may have helped some of WordPress users better grasp Hugo's own concepts and logic and, who knows, convince them to do the JAMStack jump in 2019!

As always, feel free to use the comments to drop questions, grievances or suggestions for more examples of WordPress to Hugo concept illustrations!