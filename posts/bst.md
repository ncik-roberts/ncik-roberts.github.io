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

The easy definition of a non&ndash;uniformly recursive type stands in contrast to the encumberments of polymorphic recursion. A recursive, polymorphic function in SML may only be recursively instantiated with the same type argument provided by the external client. For example, the definition of `size_complete` is disallowed because, if the external client calls `size_complete` on a term of type `'a complete_tree`, the recursive call must be instantiated at type `('a * 'a) complete_tree`. This recursive call is legal only in languages that allow for "polymorphic recursion." SML's banishment of the same is owed to an interaction with Hindley-Milner type inference: in the presence of polymorphic recursion, type inference is undecidable.

(For the interested reader, it might be illustrative to see that, in the absence of type annotations, OCaml and SML treat the definition of `fun f x = f x` as the term
![equation](https://latex.codecogs.com/png.latex?\Lambda%20t.%20\texttt{fix}%20f%20%3A%20t%20\rightarrow%200.%20\lambda%20x%20%3A%20t.%20fx), not as the term ![equation](https://latex.codecogs.com/png.latex?\texttt{fix}%20f%20%3A%20%28\forall%20t.%20t%20\rightarrow%200%29.\Lambda%20t.%20\lambda%20x%20%3A%20t.%20f[t]x).)

OCaml permits polymorphic recursion to the programmer so diligent as to provide a type annotation at the definition site of the function.

```ocaml
(* This typechecks. *)
let rec size_complete : type a. a complete_tree -> int = function
  | End -> 0
  | Depth (_, rest) -> 1 + 2 * size_complete rest
```

## Computing on complete trees
Writing a size function is pass&eacute;. There is so much more to compute.

### Existence

Given a predicate over elements, you might want to know whether a complete tree contains an element that satisfies the predicate. To start out, you can write almost mechanically:

```ocaml
let rec exists (f : 'a -> bool) (t : 'a complete_tree) : bool =
  match t with
  | End -> false
  | Depth (x, rest) -> p x || ...
```

But what to replace the ellipses with? I want to recursively determine whether `rest` contains an element that satisfies `f`, but, since `rest` is of type `('a * 'a) complete_tree`, I must construct a new predicate that operates on pairs of elements:

```ocaml
let rec exists (f : 'a -> bool) (t : 'a complete_tree) : bool =
  match t with
  | End -> false
  | Depth (x, rest) ->
      p x ||
        let p (l, r) = p l || p r in
        exists f rest
```

And finally, to allow for polymorphic recursion, I will explicitly annotate the fact that `exists` may recursively be instantiated with a different type argument than the one with which it was originally called:

```ocaml
let rec exists : type a. (a -> bool) -> a complete_tree -> bool =
  fun p t -> match t with
    | End -> false
    | Depth (x, rest) ->
      p x || exists (fun (l, r) -> p l || p r) rest
```

### Finding an element
In addition to the fact of whether an element satisfying a predicate exists, you might also want to obtain the element itself that witnesses the satisfied predicate. In the `exists` function, when constructing a predicate `p` for the recursive call, it was sufficient to lift the previous predicate to be a predicate over pairs of elements, but now I must recover the additional information of _which element satisfied the predicate_. To do this, I write a helper function where, instead of just reporting a boolean value, the accumulated function reports the satisfying element.

```ocaml
let rec find' (f : 'a -> 'b option) (t : 'a complete_tree) : 'b option =
  match t with
  | End -> None
  | Depth (x, rest) ->
      f x <|> find' (fun (l, r) -> f l <|> f r) rest
```

Here, `<|>` is the choice operator, perhaps familiar from Haskell, defined as `a <|> b = match a with Some _ -> a | _ -> b`.

Now, to complete this exercise, given a predicate, I instantiate the `find'` function with an appropriate function argument. (I also give `find'` an appropriately-polymorphic type. Since 'b does not vary at the recursive call, it does not have to be listed as an explicit type argument.)

```ocaml
let rec find' : type a. (a -> 'b option) -> a complete_tree -> 'b option =
  fun f t -> match t with
    | End -> None
    | Depth (x, xs) ->
        f x <|>
          let f' (l, r) = f l <|> f r in
          find' f' xs

let find p = find' (fun x -> if p x then Some x else None)
```

Both `find` and `exists` run in linear time, visiting each element once. This may be surprising, but the accumulated predicate `p` runs in time ![equation](https://latex.codecogs.com/png.latex?O(2^i)) at depth ![equation](https://latex.codecogs.com/png.latex?i) of the tree.

### Binary search
All the functions definitions we have encountered so far have been straightforward. To recursively process the remaining elements of the tree, we lift any function arguments to operate on pairs of elements, and make the recursive call. `size` was even simpler, requiring no such lifting.

The next function I want to implement is a existence operation on a complete binary-search tree. Suppose I already have defined `type order = Lt | Eq | Gt`. Here is the start of an attempt:

```ocaml
let rec bad_exists_bst : type a. (a -> order) -> a complete_tree -> bool =
  fun f t -> match t with
    | End -> false
    | Depth (x, rest) ->
      match f x with
      | Eq -> true
      | Lt -> ...
      | Gt -> ...
```

In the `Lt` case, we want to look only in the left (i.e. the `fst`) subtree; and in the
`Gt` case, we want to look only in the right subtree. Would you like to see the wrong way to do this?

```ocaml
let rec bad_exists_bst : type a. (a -> order) -> a complete_tree -> bool =
  fun f t -> match t with
    | End -> false
    | Depth (x, rest) ->
      match f x with
      | Eq -> true
      | Lt -> bad_exists_bst (fun (l, _) -> f l) rest
      | Gt -> bad_exists_bst (fun (_, r) -> f r) rest
```

This seems like it might work, if not only because it type-checks. But, running our newly-defined function on some trees reveals a problem.

```ocaml
# let contains n = bad_exists_bst (function
  | x when n > x -> Gt
  | x when n < x -> Lt
  | _ -> Eq);;
val contains : 'a -> 'a complete_tree -> bool = <fun>

# contains 5 (Depth (5, End));;
- : bool = true (* Ok... *)

# contains 5 (Depth (3, End));;
- : bool = false (* Right... *)

# contains 5 (Depth (3, Depth ((1, 5), End)));;
- : bool = true (* Nice *)

# contains 5 (Depth (3, Depth ((1, 4), End)));;
- : bool = false (* Ok *)

# contains 5 (Depth (3, Depth ((1, 6), Depth (((0, 2), (5, 7)), End))));;
- : bool = false (* Huh????? *)
```
