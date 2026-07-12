'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function KasirPage() {
    const [profile, setProfile] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [processing, setProcessing] = useState(false);

    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = '/login';
    }

  async function loadData() {
        setLoading(true);
        setError('');

      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
              setError('Anda belum login. Silakan login terlebih dahulu.');
              setLoading(false);
              return;
      }

      const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('id, name, branch_id, branches(name)')
          .eq('auth_user_id', authData.user.id)
          .single();

      if (profileError || !profileData) {
              setError('Profil kasir tidak ditemukan.');
              setLoading(false);
              return;
      }

      setProfile(profileData);

      const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('id, name, price, category')
          .eq('is_active', true)
          .order('category', { ascending: true });

      if (menuError) {
              setError(menuError.message);
      } else {
              setMenuItems(menuData);
      }

      setLoading(false);
  }

  useEffect(() => {
        loadData();
  }, []);

  function addToCart(item) {
        setSuccess('');
        setCart((current) => {
                const existing = current.find((c) => c.menu_item_id === item.id);
                if (existing) {
                          return current.map((c) =>
                                      c.menu_item_id === item.id ? { ...c, qty: c.qty + 1 } : c
                                                     );
                }
                return [
                          ...current,
                  { menu_item_id: item.id, name: item.name, price: item.price, qty: 1 },
                        ];
        });
  }

  function changeQty(menuItemId, delta) {
        setCart((current) =>
                current
                        .map((c) =>
                                    c.menu_item_id === menuItemId ? { ...c, qty: c.qty + delta } : c
                                     )
                        .filter((c) => c.qty > 0)
                    );
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  async function handleCheckout() {
        if (cart.length === 0 || !profile) return;

      setProcessing(true);
        setError('');
        setSuccess('');

      try {
              const { data: trxData, error: trxError } = await supabase
                .from('pos_transactions')
                .insert({
                            branch_id: profile.branch_id,
                            cashier_id: profile.id,
                        total_amount: total,
                })
                .select()
                .single();

          if (trxError) throw trxError;

          const itemRows = cart.map((c) => ({
                    pos_transaction_id: trxData.id,
                    menu_item_id: c.menu_item_id,
                    quantity: c.qty,
                    price: c.price,
          }));

          const { error: itemsError } = await supabase
                .from('pos_transaction_items')
                .insert(itemRows);

          if (itemsError) throw itemsError;

          for (const cartItem of cart) {
                    const { data: recipeRows, error: recipeError } = await supabase
                      .from('recipes')
                      .select('product_id, quantity_used')
                      .eq('menu_item_id', cartItem.menu_item_id);

                if (recipeError) throw recipeError;

                for (const recipe of recipeRows) {
                            const usedQty = recipe.quantity_used * cartItem.qty;

                      const { data: stockRow, error: stockFetchError } = await supabase
                              .from('branch_stock')
                              .select('id, quantity')
                              .eq('branch_id', profile.branch_id)
                              .eq('product_id', recipe.product_id)
                              .single();

                      if (stockFetchError && stockFetchError.code !== 'PGRST116') {
                                    throw stockFetchError;
                      }

                      if (stockRow) {
                                    const { error: stockUpdateError } = await supabase
                                      .from('branch_stock')
                                      .update({
                                                        quantity: stockRow.quantity - usedQty,
                                                        updated_at: new Date().toISOString(),
                                      })
                                      .eq('id', stockRow.id);

                              if (stockUpdateError) throw stockUpdateError;
                      } else {
                                    const { error: stockInsertError } = await supabase
                                      .from('branch_stock')
                                      .insert({
                                                        branch_id: profile.branch_id,
                                                        product_id: recipe.product_id,
                                                        quantity: -usedQty,
                                      });

                              if (stockInsertError) throw stockInsertError;
                      }
                }
          }

          setCart([]);
              setSuccess('Transaksi berhasil disimpan dan stock cabang sudah diperbarui.');
      } catch (err) {
              setError(err.message || 'Terjadi kesalahan saat memproses transaksi.');
      } finally {
              setProcessing(false);
      }
  }

  if (loading) {
        return <main style={{ padding: 24, fontFamily: 'sans-serif' }}>Memuat...</main>;
}

  if (error && !profile) {
        return (
                <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <p style={{ color: 'red' }}>{error}</p>
    </main>
    );
}

  return (
        <main style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <h1>Kasir POS</h1>
<button onClick={handleLogout} style={{ marginBottom: 16 }}>Logout</button>
{profile && (
          <p>
            Kasir: {profile.name} - Cabang: {profile.branches?.name}
 </p>
       )}

{error && <p style={{ color: 'red' }}>{error}</p>}
{success && <p style={{ color: 'green' }}>{success}</p>}

      <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
        <div style={{ flex: 2 }}>
          <h2>Menu</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
{menuItems.map((item) => (
                <button
                               key={item.id}
                onClick={() => addToCart(item)}
                style={{
                                    padding: 12,
                                    textAlign: 'left',
                                    border: '1px solid #ccc',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    background: '#fff',
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{item.category}</div>
                <div>Rp {item.price.toLocaleString('id-ID')}</div>
                </button>
            ))}
              </div>
              </div>

        <div style={{ flex: 1 }}>
          <h2>Keranjang</h2>
{cart.length === 0 && <p>Belum ada item.</p>}
 {cart.map((c) => (
               <div
                         key={c.menu_item_id}
               style={{
                                 display: 'flex',
                                 justifyContent: 'space-between',
                                 alignItems: 'center',
                                 marginBottom: 8,
               }}
            >
              <div>
                              <div>{c.name}</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  Rp {c.price.toLocaleString('id-ID')} x {c.qty}
</div>
  </div>
              <div>
                  <button onClick={() => changeQty(c.menu_item_id, -1)}>-</button>
                <span style={{ margin: '0 8px' }}>{c.qty}</span>
                <button onClick={() => changeQty(c.menu_item_id, 1)}>+</button>
  </div>
  </div>
          ))}

          <hr />
                      <p style={{ fontWeight: 'bold' }}>
            Total: Rp {total.toLocaleString('id-ID')}
</p>

          <button
            onClick={handleCheckout}
            disabled={processing || cart.length === 0}
            style={{
                            width: '100%',
                            padding: 12,
                            background: '#111',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
            }}
          >
{processing ? 'Memproses...' : 'Proses Transaksi'}
</button>
  </div>
  </div>
  </main>
  );
}
