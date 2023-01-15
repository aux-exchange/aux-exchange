// Code generated from github.com/fardream/gen-move-container
// Caution when editing manually.
// critbit tree based on http://github.com/agl/critbit
module aux::critbit {
    use aptos_std::table_with_length::{Self as table, TableWithLength as Table};
    fun swap<V>(table: &mut Table<u64, V>, i: u64, j: u64) {
        let i_item = table::remove(table, i);
        let j_item = table::remove(table, j);
        table::add(table, j, i_item);
        table::add(table, i, j_item);
    }
    fun push_back<V>(t: &mut Table<u64, V>, v: V) {
        let i = table::length(t);
        table::add(t, i, v)
    }
    fun pop_back<V>(t: &mut Table<u64, V>): V {
        let i = table::length(t) - 1;
        table::remove(t, i)
    }

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

    struct CritbitTree<V> has store {
        root: u64,
        tree: Table<u64, TreeNode>,
        min_index: u64,
        max_index: u64,
        entries: Table<u64, DataNode<V>>,
    }

    public fun new<V: store>(): CritbitTree<V> {
        CritbitTree<V> {
            root: NULL_INDEX,
            tree: table::new(),
            min_index: NULL_INDEX,
            max_index: NULL_INDEX,
            entries: table::new(),
        }
    }

    ///////////////
    // Accessors //
    ///////////////

    /// find returns the element index in the tree, or none if not found.
    public fun find<V>(tree: &CritbitTree<V>, key: u128): u64 {
        let closest_key = find_closest_key(tree, key, tree.root);

        if (closest_key != NULL_INDEX && table::borrow(&tree.entries, closest_key).key == key) {
            closest_key
        } else {
            NULL_INDEX
        }
    }

    /// borrow returns a reference to the element with its key at the given index
    public fun borrow_at_index<V>(tree: &CritbitTree<V>, index: u64): (u128, &V) {
        let entry = table::borrow(&tree.entries, index);
        (entry.key, &entry.value)
    }

    /// borrow_mut returns a mutable reference to the element with its key at the given index
    public fun borrow_at_index_mut<V>(tree: &mut CritbitTree<V>, index: u64): (u128, &mut V) {
        let entry = table::borrow_mut(&mut tree.entries, index);
        (entry.key, &mut entry.value)
    }

    /// size returns the number of elements in the CritbitTree.
    public fun size<V>(tree: &CritbitTree<V>): u64 {
        table::length(&tree.entries)
    }

    /// empty returns true if the CritbitTree is empty.
    public fun empty<V>(tree: &CritbitTree<V>): bool {
        table::length(&tree.entries) == 0
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
                current = table::borrow(&tree.tree, current).left_child;
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
                current = table::borrow(&tree.tree, current).right_child;
            };
            convert_data_index(current)
        }
    }

    /// find next value in order (the key is increasing)
    public fun next_in_order<V>(tree: &CritbitTree<V>, index: u64): u64 {
        let current = convert_data_index(index);
        let parent = table::borrow(&tree.entries, index).parent;
        if (parent == NULL_INDEX) {
            NULL_INDEX
        } else {
            while(parent != NULL_INDEX && is_right_child(tree, current, parent)) {
                current = parent;
                parent = table::borrow(&tree.tree, current).parent;
            };

            if (parent == NULL_INDEX) {
                NULL_INDEX
            } else {
                get_min_index_from(tree, table::borrow(&tree.tree, parent).right_child)
            }
        }
    }

    /// find next value in reverse order (the key is decreasing)
    public fun next_in_reverse_order<V>(tree: &CritbitTree<V>, index: u64): u64 {
        let current = convert_data_index(index);
        let parent = table::borrow(&tree.entries, index).parent;
        if (parent == NULL_INDEX) {
            NULL_INDEX
        } else {
            while (parent != NULL_INDEX && is_left_child(tree, current, parent)) {
                current = parent;
                parent = table::borrow(&tree.tree, current).parent;
            };

            if (parent == NULL_INDEX) {
                NULL_INDEX
            } else {
                get_max_index_from(tree, table::borrow(&tree.tree, parent).left_child)
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

            let node = table::borrow(&tree.tree, current);

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

        let data_index = table::length(&tree.entries);
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
        let closest_key = table::borrow(&tree.entries, closest_index).key;

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

            let node = table::borrow(&tree.tree, current);

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

        let new_parent_index = table::length(&tree.tree);
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
        if (table::borrow(&tree.entries, min_index).key > key) {
            tree.min_index = data_index;
        };
        let max_index = tree.max_index;
        if (table::borrow(&tree.entries, max_index).key < key) {
            tree.max_index = data_index;
        };
    }

    /// remove deletes and returns the element from the CritbitTree.
    public fun remove<V>(tree: &mut CritbitTree<V>, index: u64): (u128, V) {
        let old_length = table::length(&tree.entries);
        assert!(old_length > index, E_INDEX_OUT_OF_RANGE);

        if (tree.min_index == index) {
            tree.min_index = next_in_order(tree, index);
        };
        if (tree.max_index == index) {
            tree.max_index = next_in_reverse_order(tree, index);
        };

        let data_index_converted = convert_data_index(index);

        let original_parent = table::borrow(&tree.entries, index).parent;
        let is_left_child = if (original_parent != NULL_INDEX) {
            is_left_child(tree, data_index_converted, original_parent)
        } else {
            false
        };

        let end_index = old_length - 1;
        if (end_index != index) {
            let end_parent = table::borrow(&tree.entries, end_index).parent;
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

        if (table::length(&tree.entries) == 0) {
            assert!(original_parent == NULL_INDEX, E_TREE_NOT_EMPTY);
            assert!(table::length(&tree.tree) == 0, E_TREE_NOT_EMPTY);
            tree.root = NULL_INDEX;
            tree.min_index = NULL_INDEX;
            tree.max_index = NULL_INDEX;
            (key, value)
        } else {
            assert!(original_parent != NULL_INDEX, E_DATA_NODE_LACK_PARENT);
            let original_parent_node = table::borrow(&tree.tree, original_parent);
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

            let tree_size = table::length(&tree.tree);
            assert!(tree_size > original_parent, E_INDEX_OUT_OF_RANGE);
            let tree_end_index = tree_size - 1;
            if (tree_end_index != original_parent) {
                swap(&mut tree.tree, tree_end_index, original_parent);
                let switched_node = table::borrow(&tree.tree, original_parent);
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
        assert!(table::length(&tree.entries) == 0, E_CANNOT_DESTRORY_NON_EMPTY);

        let CritbitTree<V> {
            entries,
            tree,
            root: _,
            min_index: _,
            max_index: _,
        } = tree;

        table::destroy_empty(entries);
        table::destroy_empty(tree);
    }

    fun is_right_child<V>(tree: &CritbitTree<V>, index: u64, parent_index: u64): bool {
        table::borrow(&tree.tree, parent_index).right_child == index
    }

    fun is_left_child<V>(tree: &CritbitTree<V>, index: u64, parent_index: u64): bool {
        table::borrow(&tree.tree, parent_index).left_child == index
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
        table::borrow_mut(&mut tree.tree, parent_index).left_child = new_child;
        if (new_child != NULL_INDEX) {
            if (is_data_index(new_child)) {
                table::borrow_mut(&mut tree.entries, convert_data_index(new_child)).parent = parent_index;
            } else {
                table::borrow_mut(&mut tree.tree, new_child).parent = parent_index;
            };
        };
    }

    fun replace_right_child<V>(tree: &mut CritbitTree<V>, parent_index: u64, new_child: u64) {
        if (parent_index == NULL_INDEX) {
            return
        };
        table::borrow_mut(&mut tree.tree, parent_index).right_child = new_child;
        if (new_child != NULL_INDEX) {
            if (is_data_index(new_child)) {
                table::borrow_mut(&mut tree.entries, convert_data_index(new_child)).parent = parent_index;
            } else {
                table::borrow_mut(&mut tree.tree, new_child).parent = parent_index;
            };
        };
    }

    fun replace_parent<V>(tree: &mut CritbitTree<V>, child: u64, new_parent: u64) {
        if (is_data_index(child)) {
            table::borrow_mut(&mut tree.entries, convert_data_index(child)).parent = new_parent;
        } else {
            table::borrow_mut(&mut tree.tree, child).parent = new_parent;
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
}
