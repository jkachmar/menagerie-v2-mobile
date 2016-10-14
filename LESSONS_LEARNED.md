## Lessons Learned

Small attempt as a lessons-learned from this project:

### Cordova

Cordova runs web applications in an environment that makes them appear to be
native applications

#### Pros

- Easy to get started and carry an idea through to a functioning prototype
- Enough of a community that a lot of the common problems have been found
and documented somewhere
- Javascript/HTML/CSS are very commonly used, so there are more potential
maintainers 

#### Cons

- For anything more than a simple proof-of-concept, it's easy to build an
unmaintanable mess of HTML/jQuery
- Frameworks can be used to build more complex applications, but come with
a lot of overhead/incidental complexity
- Relies on others having made bindings to lower-level OS functions (e.g.
barcode scanners).

#### Takeaways

- For future proof-of-concept projects, Cordova + a simple framework (e.g. 
Vue.js) could ease some of the complexity found in handling the 
stateful/multi-view nature of a mobile app
- For future applications that are meant to be practically used, web 
technologies should be eschewed in favor of more robust languages/tools
  - Xamarin looks particularly interesting, and many people have spoken to its
  capability
  - In this instance, much of the view functionality here could be easily 
  replicated in a Xamarin.Forms app
