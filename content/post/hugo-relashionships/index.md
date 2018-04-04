---
title: "Better Relationships in Hugo"
date: 2018-04-03T16:58:31-04:00
draft: false
subtitle: with Hugo's Related Content
slug: hugo-optmized-relashionships-with-related-content
description: By using Hugo's Related Content to manage your relationships, you could reduce your build time by 70%! In this article, we see how easy it is to implement Hugo's new Related Content feature on an existing project and how it will forever optimize the way we manage relationships in Hugo.
toc: true
twitter_card: summary_large_image
tags:
 - Hugo
 - Optimization
 - Relationship
---


I recently set my mind on improving the way I dealt with relationships in my projects by using Hugo’s very own Related Content[^1]. 

__By doing so I slashed the build time by a whopping 70%__ ⏱️ 👀!

[^1]: Kudos to [@budparr](https://twitter.com/budparr) for initially suggesting I research Hugo's Related Content to manage relationships in Hugo.

In this article, we’ll see how easy it is to implement Hugo's new Related Content feature on an existing project and how it will forever optimize the way we manage relationships in Hugo!

<!--more-->

## The Project

I created and maintain this french open source [website](http://rougon-macquart.com) about [Les Rougon-Macquart](https://en.wikipedia.org/wiki/Les_Rougon-Macquart) by [Emile Zola](https://en.wikipedia.org/wiki/%C3%89mile_Zola) long before my coding days.

Copying/pasting character bios in a WordPress has been a rather lenghty hobby, but I ended with the perfect project to test drive new frameworks: WordPress Rest API, AngluarJS and more recently Hugo!

With a thousand entries sharing a healthy relationship, this is the perfect project to tryout our new relationship implementation:

- Every 1300 or so character belongs to a few novels and lists them on their page.
- Every 20 novel holds a lot of characters and lists them on their page.

## Relationship status before Related Content: it's complicated.

There was no clear way to connect pages together and form consitent and efficient relathionship. Taxonomies came to mind often, but when you need to connect Regular Pages together, they could not do.

After eliminating Taxonomies, if you were dealing with a [One-to-many relationship](https://en.wikipedia.org/wiki/One-to-many_(data_model)), you may have used `sections` with caution. 

But when implementing the most common [Many-to-many relationship](https://en.wikipedia.org/wiki/Many-to-many_(data_model)), I find the most sensible solution was to establish the relationship via a Front Matter `Param` inside the pages involved. For Zola's Les Rougon Macquart, it undeniably was.

### Let's walk through this Front Matter implementation.

In the project, novels can have up to 90 characters. Which means, if we were to have novels' Front Matter list their related characters, we'd end up with a 90 entries array at the top of our `.md` file. This is not ideal.

Beside we don't really need to have our relationship connection refered in both novels and characters.
Characters can have no more than 4 or 5 novels, so we’ll let the characters declare their __few__ novels rather than let the novel declare their __many__ characters.

For the character _Eugène Rougon_ for instance, who appears in 4 novels, we add the following.

~~~Markdown
title: Rougon (Eugène)
novel:
  - argent
  - curee
  - fortune
  - excellence
~~~

Now in the novels' Front Matter, we just need to add an identifier key. 
For the novel « Son excellence Eugène Rougon » in which stars good old Eugène we add:


```
title: Son excellence Eugène Rougon
id: excellence
```

{{< notice >}}
We could choose an existing identifier like the filename, but a unique easy to read, easy to write identifier is my option of choice
{{</ notice >}}

#### Relationships in our templates
From [Eugène's landing page](http://rougon-macquart.com/personnage/2010-03-15-rougon-eugene/) we'll need to output the novels he appears in. We can use intersect to build our list:

```go
{{ $characters := where .Site.Pages.ByTitle ".Params.novel" "intersect" (slice .Params.id)}}
```

From the novel [Son Excellence Eugène Rougon](http://rougon-macquart.com/roman/1876-son-excellence-eugene-rougon/), as we need to ouput its characters, we use the `where` operator `in`:

```go
{{ $novels := where .Site.Pages.ByTitle ".Params.id" "in" .Params.novel }}
```

Done we successuflly implemented a Many-to-many relationship like it's 2016!

Now, all of this works great but…

2. `interesect` ? `where "in"` ? Aren’t we overdoing it a bit ?
3. 🐌 Built time is roughly __7 times__ Hugo’s average: ~7 seconds for 1300 pages.
1. 💩 It looks ugly.

Oh well… what ya gonna do? 🤷‍♂️

Nothing…  that is until Hugo .27

## Enters Hugo’s Related Content

[Hugo's Related Content](https://gohugo.io/content-management/related/) has been added along Hugo .27 in November 2017.

It has been designed to help themes and projects easily build a __« See also »__ module with maximum control on the algorithm. 
You can set several factors or indices with their own level of importance. 
Tags, publishing month, authors, anything can help build your related content list.

Hands down, it is the best tool to grab pages related to a given one using your very own recipe, and if you don't already use it to build your "Related Posts/Products" widget, you should really check its [doc]((https://gohugo.io/content-management/related/)) and play with it. It's rad!

In our case though, we don't need a "Related Novels" module, we need a robust, consistent and build time friendly relationship. And as it turns out, Related Content offers just that!

We don’t even need the fancy indice factor weight, we’d have our one and only indice, `novel`.

### Implementing Relationships with Related Content

#### Declaring our indice

First we need to declare our list of indices in our `config.yaml` file. Here, we only need one: `novel` so…

```yaml
related:
 indices:
   - name: novel # The name of the indice, same as Front Matter's .Param key.
     weight: 1 # We don't really need this, but omitting it would disable the indice.
     includeNewer: true # Here our relationship is timeless! This prevents Hugo from ignoring newer posts.
```
#### Proper connecting

Our characters’ Front Matter is fine as it is. After all it already list its novels under a Param key matching our indice name, `novel`. 

On the other hand, our novels identify themselves with `id`, this will not do, they must also match the indice name. So in our novel's Front Matter:

```yaml
title: Son Excellence Eugène Rougon
novel: excellence # was previously 'id'
```
Good, our novels and characters are now sharing a common `.Page.Param` using the name of our newly declared indice: `novel`.

#### Related Content in our templates

From within our templates, Related offers several different methods to retrieve the related pages. We'll cover two of those briefly but you should check the [doc](https://gohugo.io/content-management/related/#list-related-content) to find out more.

__.Related__ _will get every related pages of a given page using the indices and weight declared in your config. It takes one parameter: the given page._

__.RelatedIndices__ _will get related pages using one or several given indices. First parameter is the given page, subsequent parameters are the indices used._


From our single templates, we will use the `.RelatedIndices` method to fetch our related novels or characters. This is to limit the related pages to our `novel` indice and prevent later added indices like tags or author to interfere with this particular relationship.

From a novel’s single template, like Son Excellence Eugène Rougon, we can now list all its, forgive my french, « personnages » like so:

```go
{{ $characters := where (.Site.RegularPages.RelatedIndices . "novel" ) "Type" "personnage" }}
```
_First param is our page context, the given page, second is our familiar indice._

And from a character’s single, like Eugène, all its « romans » :

```go
{{ $novels := where (.Site.RegularPages.RelatedIndices . "novel" ) "Type" "roman" }}
```


That’s it! We now use Hugo's Related Content to manage our Many-to-many relationship!

And what did we gain beside a cleaner code ?

🚀 __10 seconds!__ ...out of the ~7 we started with... 

Build time is now at less than 1.5s. 

{{< notice >}}
<i class="fab fa-github"></i> 
If you're curious you can fork the [repo](https://github.com/regisphilibert/rougon) and `hugo --templateMetrics` to your heart content. You can even checkout the branch [`oldRelationship`](https://github.com/regisphilibert/rougon/tree/oldRelationships) to compare it with the former relationship implementation.
{{</ notice >}}

# Conclusion
By simply using the built-in Related Content feature of Hugo instead of a DIY ugly patchwork, __we slashed the build time by more than 70%__ and all of this with __minimum code change__.

There is a tremendous benefit in trying to profit from the amazing power of core Hugo new functionnalities, and this modest article tried to show how easy it was to start using and implementing one of them in your existing projects.


Do you agree or disabree that Hugo Related Content is the best way to manage relationships with Hugo? 
I was personnally unable to find a use case where they're not, but if you do, let me know in the comments!
