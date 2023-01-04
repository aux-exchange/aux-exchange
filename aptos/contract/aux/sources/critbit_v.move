// Code generated from github.com/fardream/gen-move-container
// Caution when editing manually.
// critbit tree based on http://github.com/agl/critbit
module aux::critbit_v {
    use std::vector::{Self, swap, push_back, pop_back};

    const E_INVALID_ARGUMENT: u64 = 1;
    const E_EMPTY_TREE: u64 = 2;
    const E_TREE_NOT_EMPTY: u64 = 3;
    const E_KEY_ALREADY_EXIST: u64 = 4;
    const E_INDEX_OUT_OF_RANGE: u64 = 5;
    const E_DATA_NODE_LACK_PARENT: u64 = 6;
    const E_CANNOT_DESTRORY_NON_EMPTY: u64 = 7;
    const E_EXCEED_CAPACITY: u64 = 8;

    // NULL_INDEX is 1 << 63;
    const NULL_INDEX: u64 = 1 << 63;  // 9223372036854775808
    // MAX_U64
    const MAX_U64: u64 = 18446744073709551615;
    // Max capacity of the critbit. data index must be less than MAX_CAPACITY
    const MAX_CAPACITY: u64 = 9223372036854775807; // NULL_INDEX - 1

    // check if the index is NULL_INDEX
    public fun is_null_index(index: u64): bool {
        index == NULL_INDEX
    }

    public fun null_index_value(): u64 {
        NULL_INDEX
    }

    fun is_data_index(index: u64): bool {
        index > NULL_INDEX
    }

    fun convert_data_index(index: u64): u64 {
        MAX_U64 - index
    }

    struct DataNode<V> has store, copy, drop {
        // mask
        key: u128,
        // parent
        parent: u64,
        value: V,
    }

    struct TreeNode has store, copy, drop {
        // mask
        mask: u128,
        // parent
        parent: u64,
        // left child
        left_child: u64,
        // right child.
        right_child: u64,
    }

    struct CritbitTree<V> has store, copy, drop {
        root: u64,
        tree: vector<TreeNode>,
        min_index: u64,
        max_index: u64,
        entries: vector<DataNode<V>>,
    }

    public fun new<V>(): CritbitTree<V> {
        CritbitTree<V> {
            root: NULL_INDEX,
            tree: vector::empty(),
            min_index: NULL_INDEX,
            max_index: NULL_INDEX,
            entries: vector::empty(),
        }
    }

    ///////////////
    // Accessors //
    ///////////////

    /// find returns the element index in the tree, or none if not found.
    public fun find<V>(tree: &CritbitTree<V>, key: u128): u64 {
        let closest_key = find_closest_key(tree, key, tree.root);

        if (closest_key != NULL_INDEX && vector::borrow(&tree.entries, closest_key).key == key) {
            closest_key
        } else {
            NULL_INDEX
        }
    }

    /// borrow returns a reference to the element with its key at the given index
    public fun borrow_at_index<V>(tree: &CritbitTree<V>, index: u64): (u128, &V) {
        let entry = vector::borrow(&tree.entries, index);
        (entry.key, &entry.value)
    }

    /// borrow_mut returns a mutable reference to the element with its key at the given index
    public fun borrow_at_index_mut<V>(tree: &mut CritbitTree<V>, index: u64): (u128, &mut V) {
        let entry = vector::borrow_mut(&mut tree.entries, index);
        (entry.key, &mut entry.value)
    }

    /// size returns the number of elements in the CritbitTree.
    public fun size<V>(tree: &CritbitTree<V>): u64 {
        vector::length(&tree.entries)
    }

    /// empty returns true if the CritbitTree is empty.
    public fun empty<V>(tree: &CritbitTree<V>): bool {
        vector::length(&tree.entries) == 0
    }

    /// get index of the min of the tree.
    public fun get_min_index<V>(tree: &CritbitTree<V>): u64 {
        let current = tree.min_index;
        assert!(current != NULL_INDEX, E_EMPTY_TREE);
        current
    }

    /// get index of the min of the subtree with root at index.
    fun get_min_index_from<V>(tree: &CritbitTree<V>, index: u64): u64 {
        let current = index;
        if (current == NULL_INDEX) {
            NULL_INDEX
        } else {
            while (!is_data_index(current)) {
                current = vector::borrow(&tree.tree, current).left_child;
            };
            convert_data_index(current)
        }
    }

    /// get index of the max of the tree.
    public fun get_max_index<V>(tree: &CritbitTree<V>): u64 {
        let current = tree.max_index;
        assert!(current != NULL_INDEX, E_EMPTY_TREE);
        current
    }

    /// get index of the max of the subtree with root at index.
    fun get_max_index_from<V>(tree: &CritbitTree<V>, index: u64): u64 {
        let current = index;
        if (current == NULL_INDEX) {
            NULL_INDEX
        } else {
            while (!is_data_index(current)) {
                current = vector::borrow(&tree.tree, current).right_child;
            };
            convert_data_index(current)
        }
    }

    /// find next value in order (the key is increasing)
    public fun next_in_order<V>(tree: &CritbitTree<V>, index: u64): u64 {
        let current = convert_data_index(index);
        let parent = vector::borrow(&tree.entries, index).parent;
        if (parent == NULL_INDEX) {
            NULL_INDEX
        } else {
            while(parent != NULL_INDEX && is_right_child(tree, current, parent)) {
                current = parent;
                parent = vector::borrow(&tree.tree, current).parent;
            };

            if (parent == NULL_INDEX) {
                NULL_INDEX
            } else {
                get_min_index_from(tree, vector::borrow(&tree.tree, parent).right_child)
            }
        }
    }

    /// find next value in reverse order (the key is decreasing)
    public fun next_in_reverse_order<V>(tree: &CritbitTree<V>, index: u64): u64 {
        let current = convert_data_index(index);
        let parent = vector::borrow(&tree.entries, index).parent;
        if (parent == NULL_INDEX) {
            NULL_INDEX
        } else {
            while (parent != NULL_INDEX && is_left_child(tree, current, parent)) {
                current = parent;
                parent = vector::borrow(&tree.tree, current).parent;
            };

            if (parent == NULL_INDEX) {
                NULL_INDEX
            } else {
                get_max_index_from(tree, vector::borrow(&tree.tree, parent).left_child)
            }
        }
    }

    ///////////////
    // Modifiers //
    ///////////////


    fun find_closest_key<V>(tree: &CritbitTree<V>, key: u128, root: u64): u64 {
        let current = root;

        while (current != NULL_INDEX) {
            if (is_data_index(current)) {
                return convert_data_index(current)
            };

            let node = vector::borrow(&tree.tree, current);

            let m = node.mask & key;

            if (m != node.mask) {
                current = node.left_child;
            } else {
                current = node.right_child;
            }
        };

        NULL_INDEX
    }

    /// insert puts the value keyed at the input keys into the CritbitTree.
    /// aborts if the key is already in the tree.
    ///
    /// Process is as follows
    /// - if the tree is empty, insert the node directly.
    /// - if the tree is not empty, try to find the key in the tree. The look up will eventually reach a data node.
    ///   - if the key of the data node equals the input key, the key already exists, the process if abort.
    ///   - otherwise, rewalk the tree and find the insertion point (which is the most significant different between the key)
    public fun insert<V>(tree: &mut CritbitTree<V>, key: u128, value: V) {
        let data_node = DataNode<V>{
            key,
            value,
            parent: NULL_INDEX,
        };

        let data_index = vector::length(&tree.entries);
        assert!(
            data_index < MAX_CAPACITY,
            E_EXCEED_CAPACITY,
        );

        push_back(&mut tree.entries, data_node);

        let root = tree.root;
        let closest_index = find_closest_key(tree, key, root);

        // the closest_index will be NULL_INDEX iff tree is empty.
        if (closest_index == NULL_INDEX) {
            assert!(data_index == 0, E_TREE_NOT_EMPTY);
            tree.root = convert_data_index(data_index);
            tree.min_index = data_index;
            tree.max_index = data_index;
            return
        };

        // now the tree is not empty.
        // In this scenario, we need to make sure the insertion point is the one with the highest most significant bit.
        // Use closest_key to test for the prefix.
        // at each node, we check if the key (mask for internal node, key for data node)'s critbit is lower than the critbit formed from closest_key and key.
        // - If the critbit of the closest_key/key is higher, we insert a parent node, and append the new node as child, and attach the old key.
        let closest_key = vector::borrow(&tree.entries, closest_index).key;

        assert!(closest_key != key, E_KEY_ALREADY_EXIST);

        // get the critbit and a new mask
        let n = critbit(closest_key, key);
        let mask_new = if (n>=128) { 0u128 } else { 1u128<<(n as u8) };

        let current = tree.root;
        let insertion_parent = NULL_INDEX;
        while (current != NULL_INDEX) {
            if (is_data_index(current)) {
                break
            };

            let node = vector::borrow(&tree.tree, current);

            if (mask_new > node.mask) {
                break
            };
            insertion_parent = current;
            let m = node.mask & key;
            if (m != node.mask) {
                current = node.left_child;
            } else {
                current = node.right_child;
            }
        };

        let parent_node = TreeNode{
            parent: NULL_INDEX,
            mask: mask_new,
            left_child: NULL_INDEX,
            right_child: NULL_INDEX,
        };

        let new_parent_index = vector::length(&tree.tree);
        push_back(&mut tree.tree, parent_node);
        if (insertion_parent != NULL_INDEX) {
            replace_child(tree, insertion_parent, current, new_parent_index);
        } else {
            tree.root = new_parent_index;
        };

        let is_left_child = (mask_new & key) != mask_new;

        if (is_left_child) {
            replace_left_child(tree, new_parent_index, convert_data_index(data_index));
            replace_right_child(tree, new_parent_index, current);
        } else {
            replace_right_child(tree, new_parent_index, convert_data_index(data_index));
            replace_left_child(tree, new_parent_index, current);
        };

        let min_index = tree.min_index;
        if (vector::borrow(&tree.entries, min_index).key > key) {
            tree.min_index = data_index;
        };
        let max_index = tree.max_index;
        if (vector::borrow(&tree.entries, max_index).key < key) {
            tree.max_index = data_index;
        };
    }

    /// remove deletes and returns the element from the CritbitTree.
    public fun remove<V>(tree: &mut CritbitTree<V>, index: u64): (u128, V) {
        let old_length = vector::length(&tree.entries);
        assert!(old_length > index, E_INDEX_OUT_OF_RANGE);

        if (tree.min_index == index) {
            tree.min_index = next_in_order(tree, index);
        };
        if (tree.max_index == index) {
            tree.max_index = next_in_reverse_order(tree, index);
        };

        let data_index_converted = convert_data_index(index);

        let original_parent = vector::borrow(&tree.entries, index).parent;
        let is_left_child = if (original_parent != NULL_INDEX) {
            is_left_child(tree, data_index_converted, original_parent)
        } else {
            false
        };

        let end_index = old_length - 1;
        if (end_index != index) {
            let end_parent = vector::borrow(&tree.entries, end_index).parent;
            let is_end_index_left = is_left_child(tree, convert_data_index(end_index), end_parent);
            swap(&mut tree.entries, index, end_index);
            if (is_end_index_left) {
                replace_left_child(tree, end_parent, data_index_converted);
            } else {
                replace_right_child(tree, end_parent, data_index_converted);
            };
            if (is_left_child) {
                replace_left_child(tree, original_parent, convert_data_index(end_index));
            } else {
                replace_right_child(tree, original_parent, convert_data_index(end_index));
            };
            if (tree.max_index == end_index) {
                tree.max_index = index;
            };
            if (tree.min_index == end_index) {
                tree.min_index = index;
            }
        };

        let DataNode<V> {key, value, parent: _} = pop_back(&mut tree.entries);

        if (vector::length(&tree.entries) == 0) {
            assert!(original_parent == NULL_INDEX, E_TREE_NOT_EMPTY);
            assert!(vector::length(&tree.tree) == 0, E_TREE_NOT_EMPTY);
            tree.root = NULL_INDEX;
            tree.min_index = NULL_INDEX;
            tree.max_index = NULL_INDEX;
            (key, value)
        } else {
            assert!(original_parent != NULL_INDEX, E_DATA_NODE_LACK_PARENT);
            let original_parent_node = vector::borrow(&tree.tree, original_parent);
            let other_child = if (is_left_child) {
                original_parent_node.right_child
            } else {
                original_parent_node.left_child
            };
            let grand_parent = original_parent_node.parent;
            if (grand_parent == NULL_INDEX) {
                replace_parent(tree, other_child, NULL_INDEX);
                tree.root = other_child;
            } else {
                replace_child(tree, grand_parent, original_parent, other_child);
            };

            let tree_size = vector::length(&tree.tree);
            assert!(tree_size > original_parent, E_INDEX_OUT_OF_RANGE);
            let tree_end_index = tree_size - 1;
            if (tree_end_index != original_parent) {
                swap(&mut tree.tree, tree_end_index, original_parent);
                let switched_node = vector::borrow(&tree.tree, original_parent);
                let left_child = switched_node.left_child;
                let right_child = switched_node.right_child;
                let new_parent = switched_node.parent;
                if (switched_node.parent != NULL_INDEX) {
                    replace_child(tree, new_parent, tree_end_index, original_parent);
                };
                replace_left_child(tree, original_parent, left_child);
                replace_right_child(tree, original_parent, right_child);
                if (tree.root == tree_end_index) {
                    tree.root = original_parent;
                };
            };
            pop_back(&mut tree.tree);
            (key, value)
        }
    }

    /// destroys the tree if it's empty.
    public fun destroy_empty<V>(tree: CritbitTree<V>) {
        assert!(vector::length(&tree.entries) == 0, E_CANNOT_DESTRORY_NON_EMPTY);

        let CritbitTree<V> {
            entries,
            tree,
            root: _,
            min_index: _,
            max_index: _,
        } = tree;

        vector::destroy_empty(entries);
        vector::destroy_empty(tree);
    }

    fun is_right_child<V>(tree: &CritbitTree<V>, index: u64, parent_index: u64): bool {
        vector::borrow(&tree.tree, parent_index).right_child == index
    }

    fun is_left_child<V>(tree: &CritbitTree<V>, index: u64, parent_index: u64): bool {
        vector::borrow(&tree.tree, parent_index).left_child == index
    }

    /// Replace the child of parent if parent_index is not NULL_INDEX.
    fun replace_child<V>(tree: &mut CritbitTree<V>, parent_index: u64, original_child: u64, new_child: u64) {
        if (parent_index != NULL_INDEX) {
            if (is_right_child(tree, original_child, parent_index)) {
                replace_right_child(tree, parent_index, new_child);
            } else if (is_left_child(tree, original_child, parent_index)) {
                replace_left_child(tree, parent_index, new_child);
            }
        }
    }

    fun replace_left_child<V>(tree: &mut CritbitTree<V>, parent_index: u64, new_child: u64) {
        if (parent_index == NULL_INDEX) {
            return
        };
        vector::borrow_mut(&mut tree.tree, parent_index).left_child = new_child;
        if (new_child != NULL_INDEX) {
            if (is_data_index(new_child)) {
                vector::borrow_mut(&mut tree.entries, convert_data_index(new_child)).parent = parent_index;
            } else {
                vector::borrow_mut(&mut tree.tree, new_child).parent = parent_index;
            };
        };
    }

    fun replace_right_child<V>(tree: &mut CritbitTree<V>, parent_index: u64, new_child: u64) {
        if (parent_index == NULL_INDEX) {
            return
        };
        vector::borrow_mut(&mut tree.tree, parent_index).right_child = new_child;
        if (new_child != NULL_INDEX) {
            if (is_data_index(new_child)) {
                vector::borrow_mut(&mut tree.entries, convert_data_index(new_child)).parent = parent_index;
            } else {
                vector::borrow_mut(&mut tree.tree, new_child).parent = parent_index;
            };
        };
    }

    fun replace_parent<V>(tree: &mut CritbitTree<V>, child: u64, new_parent: u64) {
        if (is_data_index(child)) {
            vector::borrow_mut(&mut tree.entries, convert_data_index(child)).parent = new_parent;
        } else {
            vector::borrow_mut(&mut tree.tree, child).parent = new_parent;
        }
    }

    fun critbit(s1: u128, s2: u128): u32 {
        128 - count_leading_zeros(s1^s2) - 1
    }

    fun count_leading_zeros(x: u128): u32 {
        if (x == 0) {
            128
        } else {
            let n: u32 = 0;
            if (x & 340282366920938463444927863358058659840 == 0) {
                // x's higher 64 is all zero, shift the lower part over
                x = x << 64;
                n = n + 64;
            };
            if (x & 340282366841710300949110269838224261120 == 0) {
                // x's higher 32 is all zero, shift the lower part over
                x = x << 32;
                n = n + 32;
            };
            if (x & 340277174624079928635746076935438991360 == 0) {
                // x's higher 16 is all zero, shift the lower part over
                x = x << 16;
                n = n + 16;
            };
            if (x & 338953138925153547590470800371487866880 == 0) {
                // x's higher 8 is all zero, shift the lower part over
                x = x << 8;
                n = n + 8;
            };
            if (x & 319014718988379809496913694467282698240 == 0) {
                // x's higher 4 is all zero, shift the lower part over
                x = x << 4;
                n = n + 4;
            };
            if (x & 255211775190703847597530955573826158592 == 0) {
                // x's higher 2 is all zero, shift the lower part over
                x = x << 2;
                n = n + 2;
            };
            if (x & 170141183460469231731687303715884105728 == 0) {
                n = n + 1;
            };

            n
        }
    }

    #[test_only]
    fun new_entry_for_test<V>(key: u128, value: V, parent: u64): DataNode<V> {
        DataNode<V> {
            key,
            value,
            parent,
        }
    }
    #[test_only]
    fun new_tree_entry_for_test(mask: u128, parent: u64, left_child: u64, right_child: u64): TreeNode {
        TreeNode {
            mask,
            parent,
            left_child,
            right_child,
        }
    }

    #[test]
    fun test_critbit() {
        let bst = new<u128>();
        insert(&mut bst, 6, 6);
        insert(&mut bst, 5, 5);
        insert(&mut bst, 4, 4);
        //                 010
        //               /     \
        //             001   110 (6)
        //            /   \
        //         100(4) 101(5)
        let v3_bst = CritbitTree<u128> {
            root: 0,
            entries: vector<DataNode<u128>> [
                new_entry_for_test<u128>(6, 6, 0),
                new_entry_for_test<u128>(5, 5, 1),
                new_entry_for_test<u128>(4, 4, 1),
            ],
            tree: vector<TreeNode> [
                new_tree_entry_for_test(2, NULL_INDEX, 1, convert_data_index(0)),
                new_tree_entry_for_test(1, 0, convert_data_index(2), convert_data_index(1)),
            ],
            min_index: 2,
            max_index: 0,
        };
        assert!(bst == v3_bst, 3);

        insert(&mut bst, 1, 1);
        let v4_bst = CritbitTree<u128> {
            root: 2,
            entries: vector<DataNode<u128>> [
                new_entry_for_test<u128>(6, 6, 0),
                new_entry_for_test<u128>(5, 5, 1),
                new_entry_for_test<u128>(4, 4, 1),
                new_entry_for_test<u128>(1, 1, 2),
            ],
            tree: vector<TreeNode> [
                new_tree_entry_for_test(2, 2, 1, convert_data_index(0)),
                new_tree_entry_for_test(1, 0, convert_data_index(2), convert_data_index(1)),
                new_tree_entry_for_test(4, NULL_INDEX, convert_data_index(3), 0),
            ],
            min_index: 3,
            max_index: 0,
        };
        //             100
        //            /    \
        //        001(1)   010
        //               /     \
        //             001    110(6)
        //            /   \
        //         100(4) 101(5)
        assert!(&bst == &v4_bst, 4);

        insert(&mut bst, 3, 3);
        let v5_bst = CritbitTree<u128> {
            root: 2,
            entries: vector<DataNode<u128>> [
                new_entry_for_test<u128>(6, 6, 0),
                new_entry_for_test<u128>(5, 5, 1),
                new_entry_for_test<u128>(4, 4, 1),
                new_entry_for_test<u128>(1, 1, 3),
                new_entry_for_test<u128>(3, 3, 3),
            ],
            tree: vector<TreeNode> [
                new_tree_entry_for_test(2, 2, 1, convert_data_index(0)),
                new_tree_entry_for_test(1, 0, convert_data_index(2), convert_data_index(1)),
                new_tree_entry_for_test(4, NULL_INDEX, 3, 0),
                new_tree_entry_for_test(2, 2, convert_data_index(3), convert_data_index(4)),
            ],
            min_index: 3,
            max_index: 0,
        };
        //                100
        //            /          \
        //        010            010
        //      /    \         /     \
        //   001(1) 011(3)   001    110(6)
        //                   /   \
        //                100(4) 101(5)
        assert!(&bst == &v5_bst, 5);

        insert(&mut bst, 2, 2);
        let v6_bst = CritbitTree<u128> {
            root: 2,
            entries: vector<DataNode<u128>> [
                new_entry_for_test<u128>(6, 6, 0),
                new_entry_for_test<u128>(5, 5, 1),
                new_entry_for_test<u128>(4, 4, 1),
                new_entry_for_test<u128>(1, 1, 3),
                new_entry_for_test<u128>(3, 3, 4),
                new_entry_for_test<u128>(2, 2, 4),
            ],
            tree: vector<TreeNode> [
                new_tree_entry_for_test(2, 2, 1, convert_data_index(0)),
                new_tree_entry_for_test(1, 0, convert_data_index(2), convert_data_index(1)),
                new_tree_entry_for_test(4, NULL_INDEX, 3, 0),
                new_tree_entry_for_test(2, 2, convert_data_index(3), 4),
                new_tree_entry_for_test(1, 3, convert_data_index(5), convert_data_index(4)),
            ],
            min_index: 3,
            max_index: 0,
        };
        //                  100
        //            /                \
        //        010                  010
        //      /    \                /   \
        //   001(1)  001            001  110(6)
        //          /   \          /   \
        //      010(2) 011(3)  100(4) 101(5)
        assert!(&bst == &v6_bst, 6);

        let idx = get_min_index(&bst);
        let (current_key,_) = borrow_at_index(&bst, idx);
        while (idx != NULL_INDEX) {
            let next_idx = next_in_order(&bst, idx);
            if (next_idx != NULL_INDEX) {
                let (next_key, _) = borrow_at_index(&bst, next_idx);
                assert!(next_key > current_key, (next_key as u64));
                current_key = next_key;
            };
            idx = next_idx;
        };

        assert!(current_key == 6, (current_key as u64));

        let idx = get_max_index(&bst);
        let (current_key,_) = borrow_at_index(&bst, idx);
        while (idx != NULL_INDEX) {
            let next_idx = next_in_reverse_order(&bst, idx);
            if (next_idx != NULL_INDEX) {
                let (next_key, _) = borrow_at_index(&bst, next_idx);
                assert!(next_key < current_key, (next_key as u64));
                current_key = next_key;
            };
            idx = next_idx;
        };

        assert!(current_key == 1, (current_key as u64));
    }

    #[test]
    fun test_remove_critbit() {
        let bst = CritbitTree<u128> {
            root: 2,
            entries: vector<DataNode<u128>> [
                new_entry_for_test<u128>(6, 6, 0),
                new_entry_for_test<u128>(5, 5, 1),
                new_entry_for_test<u128>(4, 4, 1),
                new_entry_for_test<u128>(1, 1, 3),
                new_entry_for_test<u128>(3, 3, 4),
                new_entry_for_test<u128>(2, 2, 4),
            ],
            tree: vector<TreeNode> [
                new_tree_entry_for_test(2, 2, 1, convert_data_index(0)),
                new_tree_entry_for_test(1, 0, convert_data_index(2), convert_data_index(1)),
                new_tree_entry_for_test(4, NULL_INDEX, 3, 0),
                new_tree_entry_for_test(2, 2, convert_data_index(3), 4),
                new_tree_entry_for_test(1, 3, convert_data_index(5), convert_data_index(4)),
            ],
            min_index: 3,
            max_index: 0,
        };

        remove(&mut bst, 3);
        //                  100
        //            /                \
        //        001                  010
        //      /    \                /   \
        //   010(2)  011(3)         001  110(6)
        //                          /   \
        //                    100(4) 101(5)
        let v5_bst = CritbitTree<u128> {
            root: 2,
            entries: vector<DataNode<u128>> [
                new_entry_for_test<u128>(6, 6, 0),
                new_entry_for_test<u128>(5, 5, 1),
                new_entry_for_test<u128>(4, 4, 1),
                new_entry_for_test<u128>(2, 2, 3),
                new_entry_for_test<u128>(3, 3, 3),
            ],
            tree: vector<TreeNode> [
                new_tree_entry_for_test(2, 2, 1, convert_data_index(0)),
                new_tree_entry_for_test(1, 0, convert_data_index(2), convert_data_index(1)),
                new_tree_entry_for_test(4, NULL_INDEX, 3, 0),
                new_tree_entry_for_test(1, 2, convert_data_index(3), convert_data_index(4)),
            ],
            min_index: 3,
            max_index: 0,
        };
        assert!(&bst == &v5_bst, 5);

        remove(&mut bst, 3);
        //                100
        //            /          \
        //        011(3)         010
        //                      /   \
        //                     001  110(6)
        //                    /   \
        //              100(4) 101(5)
        let v4_bst = CritbitTree<u128> {
            root: 2,
            entries: vector<DataNode<u128>> [
                new_entry_for_test<u128>(6, 6, 0),
                new_entry_for_test<u128>(5, 5, 1),
                new_entry_for_test<u128>(4, 4, 1),
                new_entry_for_test<u128>(3, 3, 2),
            ],
            tree: vector<TreeNode> [
                new_tree_entry_for_test(2, 2, 1, convert_data_index(0)),
                new_tree_entry_for_test(1, 0, convert_data_index(2), convert_data_index(1)),
                new_tree_entry_for_test(4, NULL_INDEX, convert_data_index(3), 0),
            ],
            min_index: 3,
            max_index: 0,
        };
        assert!(&bst == &v4_bst, 4);

        remove(&mut bst, 1);
        //              100
        //            /      \
        //        011(3)     010
        //                  /   \
        //               100(4)  110(6)
        let v3_bst = CritbitTree<u128> {
            root: 1,
            entries: vector<DataNode<u128>> [
                new_entry_for_test<u128>(6, 6, 0),
                new_entry_for_test<u128>(3, 3, 1),
                new_entry_for_test<u128>(4, 4, 0),
            ],
            tree: vector<TreeNode> [
                new_tree_entry_for_test(2, 1, convert_data_index(2), convert_data_index(0)),
                new_tree_entry_for_test(4, NULL_INDEX, convert_data_index(1), 0),
            ],
            min_index: 1,
            max_index: 0,
        };
        assert!(&bst == &v3_bst, 3);

        remove(&mut bst, 0);
        //              100
        //            /      \
        //        011(3)     100(4)
        let v2_bst = CritbitTree<u128> {
            root: 0,
            entries: vector<DataNode<u128>> [
                new_entry_for_test<u128>(4, 4, 0),
                new_entry_for_test<u128>(3, 3, 0),
            ],
            tree: vector<TreeNode> [
                new_tree_entry_for_test(4, NULL_INDEX, convert_data_index(1), convert_data_index(0)),
            ],
            min_index: 1,
            max_index: 0,
        };
        assert!(&bst == &v2_bst, 2);

        remove(&mut bst, 0);
        //         011(3)
        let v1_bst = CritbitTree<u128> {
            root: convert_data_index(0),
            entries: vector<DataNode<u128>> [
                new_entry_for_test<u128>(3, 3, NULL_INDEX),
            ],
            tree: vector<TreeNode> [
            ],
            min_index: 0,
            max_index: 0,
        };
        assert!(&bst == &v1_bst, 2);


        remove(&mut bst, 0);
        //         empty
        let v0_bst = CritbitTree<u128> {
            root: NULL_INDEX,
            entries: vector<DataNode<u128>> [],
            tree: vector<TreeNode> [],
            min_index: NULL_INDEX,
            max_index: NULL_INDEX,
        };
        assert!(&bst == &v0_bst, 2);
    }
}
