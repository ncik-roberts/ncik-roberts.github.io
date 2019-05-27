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
  | Depth (_, rest) -> 1 + 2 * size_complete rest
```

`size` is linear in the number of elements, whereas `size_complete` is logarithmic.

## Polymorphic recursion

It's possible to skip this section if you're just interested in seeing some functions
written over the `complete_tree` type. Read this section only if you're confused why
the OCaml compiler, upon encountering the `size_complete` function definition, raises
an error like:

```
Error: This expression has type ('a * 'a) complete_tree
       but an expression was expected of type 'a complete_tree
              The type variable 'a occurs inside 'a * 'a
```

This error results from an asymmetry in the definition of OCaml (and, in Okasaki's case, of SML): non&ndash;uniformly recursive types are permitted, but non&ndash;uniformly recursive functions are much harder to work with, and, in the case of SML, disallowed.

Put simply: `tree` is a uniformly recursive type because its only recursive instantiations take as argument the original type variable `'a` that was abstracted over. In contrast, `complete_tree` is not uniformly recursive, because it is recursively applied to the type argument `('a * 'a)`, which differs from the type variable `'a` that was abstracted over.

The easy definition of a non&ndash;uniformly recursive type stands in contrast to the encumberments of polymorphic recursion. A polymorphic, recursive function in SML may only be recursively instantiated with the same type argument provided by the external client. For example, the definition of `size_complete` is disallowed because, if the external client calls `size_complete` on a term of type `'a complete_tree`, the recursive call must be instantiated at type `('a * 'a) complete_tree`. This is owed to an interaction with Hindley-Milner type inference: in the presence of polymorphic recursion, type inference is undecidable.

(For the interested reader, it might be illustrative to see that, in the absence of type annotations, OCaml and SML treat the definition of `fun f x = f x` as the term
![equation](https://latex.codecogs.com/png.latex?\Lambda%20t.%20\texttt{fix}%20f%20%3A%20t%20\rightarrow%200.%20\lambda%20x%20%3A%20t.%20fx), not as the term ![equation](https://latex.codecogs.com/png.latex?\texttt{fix}%20f%20%3A%20(\forall%20t.%20t%20\rightarrow%200%29.\Lambda%20t.%20\lambda%20x%20%3A%20t.%20f[t]x).)

OCaml allows polymorphic recursion to the programmer so diligent as to provide a type
annotation at the definition site of the function.

```ocaml
(* This typechecks. *)
let rec size_complete : type a. a complete_tree -> int = function
  | End -> 0
  | Depth (_, rest) -> 1 + 2 * size_complete rest
```

## Computing with complete trees

