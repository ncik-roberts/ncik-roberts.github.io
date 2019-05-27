# Binary search on guaranteed-complete binary trees

In Chapter 10 of [Purely Function Data Structures](https://www.amazon.com/Purely-Functional-Data-Structures-Okasaki/dp/0521663504),
Chris Okasaki introduces a non-uniform type definition for a sequence, in particular:
"a sequence [of elements] is either empty or a single element together with a sequence of pairs of elements." But we have a better name for such a sequence: a complete binary tree. In this post, I will wax poetic on non-uniform recursion and write some functions over a complete binary tree.

Contrast the following two OCaml definitions of a tree type:

```ocaml
type 'a tree =
  | Empty
  | Node of 'a tree * 'a * 'a tree

type 'a complete_tree =
  | End
  | Depth of 'a * ('a * 'a) complete_tree
```

The ordinary definition of `tree` allows any tree to be constructed, but `complete_tree` imposes
additional constraints, by requiring that there be ![equation](https://latex.codecogs.com/png.latex?2^n) elements present at depth ![equation](https://latex.codecogs.com/png.latex?n) of the tree. In return for the extra hassle, `complete_tree` allows a more efficient definition
of `size`, which returns the number of elements in the tree:

```ocaml
let rec size = function
  | Empty -> 0
  | Node (left, _, right) -> 1 + size left + size right

let rec size_complete = function
  | End -> 0
  | Depth (_, rest) -> 1 + 2 * rest
```

`size` is linear in the number of elements, whereas `size_complete` is logarithmic.

## Non-uniform recursion

It's possible to skip this section if you're just interested in seeing some functions
written over the `complete_tree` type. Read this section only if you're confused why
the OCaml compiler, upon encountering the `size_complete` function definition, raises
an error like:

```
Error: This expression has type ('a * 'a) complete_tree
       but an expression was expected of type 'a complete_tree
              The type variable 'a occurs inside 'a * 'a
```

This error results from an asymmetry in the definition of OCaml (and, in Okasaki's case, of SML): non&ndash;uniformly recursive types are permitted, but
non&ndash;uniformly recursive functions are much harder to work with, and, in the case of SML, disallowed.

What do I mean by "uniformly recursive?"
A uniformly recursive type is a recursive, universal type that is only ever recursively instantiated with the parameter to the universal type. It is therefore just a universal recursive type, in that order. Entering into the language of type theory, we may say that an OCaml type definition of the form `type 'a t = <texp>` binds to identifier `t` a type of the form ![equation](https://latex.codecogs.com/png.latex?\mu t.\forall \alpha.\tau), where ![equation](https://latex.codecogs.com/png.latex?\alpha) and ![equation](https://latex.codecogs.com/png.latex?t) are free in ![equation](https://latex.codecogs.com/png.latex?\tau). (In this section, I alternate between OCaml and mathematical notation as appropriate. The OCaml type variable `'a` is written as ![equation](https://latex.codecogs.com/png.latex?\alpha) in mathematical notation, and I use ![equation](https://latex.codecogs.com/png.latex?\tau) to signify an arbitrary type expression, which I normally write as `<texp>` in the OCaml notation.) Within the type expression, the type variable `t` will only ever appear as the immediate right-hand side of a type application `<texp> t` (where, since OCaml and SML mirror the notation for type application, this would mathematically be notated as ![equation](https://latex.codecogs.com/png.latex?t[\tau])). In a uniformly recursive type, the argument (left-hand side in OCaml notation; right-hand side in mathematical notation) to a type application is only ever the type parameter to the universal type, `'a` (or ![equation](https://latex.codecogs.com/png.latex?\alpha)). A uniformly-recursive type ![equation](https://latex.codecogs.com/png.latex?\mu t.\forall \alpha.\tau) is therefore isomorphic to the type ![equation](https://latex.codecogs.com/png.latex?\forall \alpha. \mu t. \tau), since in the former, we can replace
all applications `'a t` with just `t` to obtain the latter.
