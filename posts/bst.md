# Binary search on guaranteed-complete binary trees

Code is in OCaml, but a Haskell appendix is provided.

In Chapter 10 of [Purely Function Data Structures](https://www.amazon.com/Purely-Functional-Data-Structures-Okasaki/dp/0521663504),
Chris Okasaki introduces a non-uniform type definition for a sequence, in particular:
"a sequence is either empty or a single element together with a sequence of pairs of elements."
But we have a better name for such a sequence: a complete binary tree.

Contrast the following two definitions of a tree type:

```OCaml
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

```OCaml
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
non&ndash;uniformly recursive functions are disallowed. We'll see shortly that later versions of OCaml
provide workarounds to this, but SML provides no such affordances. What do I mean by "uniformly recursive?"
A uniformly recursive type is a recursive, polymorphic type that is only ever recursively
instantiated with the polymorphic type argument. It is therefore just a polymorphic recursive type, in that
order. Entering into the language of type theory, we may say that an OCaml type definition of the form
`type 'a t = <texp>` binds to identifier `t` a type of the form ![equation](https://latex.codecogs.com/png.latex?%5Cmu%20t.%20%5Cforall%20%5Calpha.%20%5Ctexttt%7Btexp%7D),
where `'a` and `t` are free in `texp`.
