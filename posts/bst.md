# Binary search on guaranteed-complete binary trees

Code is in OCaml, but a Haskell appendix is provided.

In Chapter 10 of [Purely Function Data Structures](https://www.amazon.com/Purely-Functional-Data-Structures-Okasaki/dp/0521663504),
Chris Okasaki introduces a non-uniform type definition for a sequence, in particular:
"a sequence is either empty or a single element together with a sequence of pairs of elements."
But we have a better name for such a sequence: a complete binary tree.

Contrast the following two definitions of a tree type:

```ocaml
type 'a tree =
  | Empty
  | Node of 'a tree * 'a * 'a tree

type 'a complete_tree =
  | Empty'
  | Node' of 'a * ('a * 'a) complete_tree
```

The ordinary definition of `tree` allows any tree to be constructed, but `complete_tree` imposes
additional constraints. In return for the extra hassle, `complete_tree` allows a more efficient definition
of `size`, which returns the number of elements in the tree:

```ocaml
let rec size = function
  | Empty -> 0
  | Node (left, _, right) -> 1 + size left + size right

let rec size_complete = function
  | Empty' -> 0
  | Node' (_, rest) -> 1 + 2 * rest
```

`size` is linear in the number of elements, whereas `size_complete` is logarithmic.

However, running these two function definitions past an OCaml compiler will reveal an asymmetry in the
definition of OCaml (and, in Okasaki's case, of SML): non&ndash;uniformly recursive types are permitted, but
non&ndash;uniformly recursive functions are much harder to work with, and, in the case of SML, disallowed.

What do I mean by "uniformly recursive?"
A uniformly recursive type is a recursive, polymorphic type that is only ever recursively
instantiated with the polymorphic type argument. It is therefore just a polymorphic recursive type, in that
order. Entering into the language of type theory, we may say that an OCaml type definition of the form
`type 'a t = <texp>` binds to identifier `t` a type of the form ![equation](https://latex.codecogs.com/png.latex?\mu t.\forall \alpha.\tau),
where `'a` and `t` are free in ![equation](https://latex.codecogs.com/png.latex?\tau). Within the type expression, the type variable `t` will
appear immediately only ever as the right-hand side of a type application `<texp> t`
(where, since OCaml and SML mirror the notation for type application, this would normally be notated as
![equation](https://latex.codecogs.com/png.latex?t[\tau])). In a uniformly recursive type, the argument (left-hand side in OCaml notation;
right-hand side in standard notation) to a type application is only ever the type parameter to the universal type, `'a`
(or ![equation](https://latex.codecogs.com/png.latex?\alpha)). A uniformly-recursive type ![equation](https://latex.codecogs.com/png.latex?\mu t.\forall \alpha.\tau)
is therefore isomorphic to the type ![equation](https://latex.codecogs.com/png.latex?\forall \alpha. \mu t. \tau), witnessed by the equations
