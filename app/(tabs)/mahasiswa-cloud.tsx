/**
 * mahasiswa-cloud.tsx — CRUD Mahasiswa via Supabase.
 * Menjaga desain asli tabel & card dengan tambahan fitur Tambah, Edit, Hapus.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type MahasiswaRow = {
  id: string;
  nim: string;
  nama: string;
  prodi: string;
  kelas: string | null;
  created_at: string;
  updated_at: string;
};

export default function MahasiswaCloudScreen() {
  const [rows, setRows] = useState<MahasiswaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- CRUD States ---
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nim: '', nama: '', prodi: '', kelas: '' });

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isNarrow = width < 420;
  const padH = Math.max(16, Math.min(24, width * 0.045));

  const loadData = useCallback(async () => {
    if (!supabase) {
      setRows([]);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setError(null);
    const { data, error: qErr } = await supabase
      .from('mahasiswa')
      .select('id,nim,nama,prodi,kelas,created_at,updated_at')
      .order('nim', { ascending: true });

    if (qErr) {
      setError(qErr.message);
      setRows([]);
    } else {
      setRows((data as MahasiswaRow[]) ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // --- CRUD Logics ---
  const openModal = (item?: MahasiswaRow) => {
    if (item) {
      setEditingId(item.id);
      setForm({ nim: item.nim, nama: item.nama, prodi: item.prodi, kelas: item.kelas ?? '' });
    } else {
      setEditingId(null);
      setForm({ nim: '', nama: '', prodi: '', kelas: '' });
    }
    setModalVisible(true);
  };

  const saveMahasiswa = async () => {
    if (!supabase) return;
    if (!form.nim || !form.nama) {
      Alert.alert('Error', 'NIM dan Nama tidak boleh kosong.');
      return;
    }

    setLoading(true);
    const { error: saveErr } = editingId
      ? await supabase.from('mahasiswa').update(form).eq('id', editingId)
      : await supabase.from('mahasiswa').insert([form]);

    if (saveErr) {
      Alert.alert('Error', saveErr.message);
      setLoading(false);
    } else {
      setModalVisible(false);
      loadData();
    }
  };

  const deleteMahasiswa = (id: string) => {
    if (!supabase) return;
    Alert.alert('Konfirmasi', 'Hapus mahasiswa ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const { error: delErr } = await supabase
            .from('mahasiswa')
            .delete()
            .eq('id', id);
          if (delErr) Alert.alert('Error', delErr.message);
          else loadData();
        },
      },
    ]);
  };

  const configured = isSupabaseConfigured();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: padH,
            paddingBottom: 32 + insets.bottom,
          },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={configured} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRowSpace}>
          <View>
            <Text style={styles.title}>Data Mahasiswa (Cloud)</Text>
            <Text style={styles.subtitle}>
              Data dari tabel <Text style={styles.mono}>public.mahasiswa</Text>
            </Text>
          </View>
          {configured && (
            <Pressable style={styles.btnAdd} onPress={() => openModal()}>
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          )}
        </View>

        {!configured ? (
          <Text style={styles.errText}>Konfigurasi .env belum ditemukan.</Text>
        ) : null}

        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text style={styles.muted}>Memuat data…</Text>
          </View>
        ) : null}

        {error && configured ? <Text style={styles.errText}>{error}</Text> : null}

        {!loading && configured && !error ? (
          <Text style={styles.count}>Total {rows.length} mahasiswa</Text>
        ) : null}

        {/* --- VIEW: CARD (Mobile) --- */}
        {!loading && configured && !error && rows.length > 0 && isNarrow ? (
          <View style={styles.cardList}>
            {rows.map((m, index) => (
              <View key={m.id} style={styles.card}>
                <View style={styles.cardHeaderAction}>
                  <Text style={styles.cardValueBold}>#{index + 1}</Text>
                </View>
                
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>NIM</Text>
                  <Text style={styles.cardValue}>{m.nim}</Text>
                </View>
                
                <View style={styles.separator} />
                
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Nama</Text>
                  <Text style={[styles.cardValue, styles.cardValueBold]}>{m.nama}</Text>
                </View>
                
                <View style={styles.separator} />
                
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Prodi</Text>
                  <Text style={styles.cardValue}>{m.prodi}</Text>
                </View>
                
                <View style={styles.separator} />
                
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Kelas</Text>
                  <Text style={styles.cardValue}>{m.kelas ?? '—'}</Text>
                </View>
                
                <View style={styles.separator} />
                
                <View
                  style={[
                    styles.cardRow,
                    {
                      justifyContent: 'flex-end',
                      gap: 8,
                      paddingTop: 7,
                      paddingBottom: 8,
                    },
                  ]}
                >
                  <Pressable style={styles.btnEdit} onPress={() => openModal(m)}>
                    <Text style={styles.btnEditText}>Edit</Text>
                  </Pressable>
                  <Pressable style={styles.btnDelete} onPress={() => deleteMahasiswa(m.id)}>
                    <Text style={styles.btnDeleteText}>Hapus</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* --- VIEW: TABLE (Tablet/Desktop) --- */}
        {!loading && configured && !error && rows.length > 0 && !isNarrow ? (
          <>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.cellNo, styles.headerText]}>No</Text>
              <Text style={[styles.cell, styles.cellNim, styles.headerText]}>NIM</Text>
              <Text style={[styles.cell, styles.cellNama, styles.headerText]}>Nama</Text>
              <Text style={[styles.cell, styles.cellProdi, styles.headerText]}>Prodi</Text>
              <Text style={[styles.cell, styles.cellKelas, styles.headerText]}>Kelas</Text>
              <View style={styles.cellActionWrapper} />
            </View>
            {rows.map((m, index) => (
              <View key={m.id} style={styles.row}>
                <Text style={[styles.cell, styles.cellNo]}>{index + 1}</Text>
                <Text style={[styles.cell, styles.cellNim]}>{m.nim}</Text>
                <Text style={[styles.cell, styles.cellNama]}>{m.nama}</Text>
                <Text style={[styles.cell, styles.cellProdi]}>{m.prodi}</Text>
                <View style={[styles.cell, styles.cellKelas, { flexDirection: 'row', gap: 8 }]}>
                  <Text style={{ flex: 1 }}>{m.kelas ?? '—'}</Text>
                  <Pressable style={styles.btnEdit} onPress={() => openModal(m)}>
                    <Text style={styles.btnEditText}>Edit</Text>
                  </Pressable>
                  <Pressable style={styles.btnDelete} onPress={() => deleteMahasiswa(m.id)}>
                    <Text style={styles.btnDeleteText}>Hapus</Text>
                  </Pressable>
                </View>
                <View style={styles.cellActionWrapper} />
              </View>
            ))}
          </>
        ) : null}

        {configured && !loading ? (
          <Pressable
            style={({ pressed }) => [styles.btnRefresh, pressed && styles.btnPressed]}
            onPress={onRefresh}
          >
            <Text style={styles.btnRefreshText}>Muat ulang</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {/* --- MODAL FORM --- */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Data' : 'Tambah Mahasiswa'}</Text>
            <TextInput
              style={styles.input}
              placeholder="NIM"
              value={form.nim}
              onChangeText={(t) => setForm({ ...form, nim: t })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Nama"
              value={form.nama}
              onChangeText={(t) => setForm({ ...form, nama: t })}
            />
             <View style={styles.formGroup}>
              <TextInput
                placeholder="Masukkan Prodi"
                style={styles.input}
                value={form.prodi}
                onChangeText={(v) => setForm({ ...form, prodi: v })}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Kelas"
              value={form.kelas}
              onChangeText={(t) => setForm({ ...form, kelas: t })}
            />

            <View style={styles.modalBtns}>
              <Pressable
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: '#666' }}>Batal</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnSave]} onPress={saveMahasiswa}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Simpan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingBottom: 32 },
  headerRowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#5c5c5c' },
  btnAdd: { backgroundColor: '#1A237E', padding: 10, borderRadius: 10 },
  mono: { fontFamily: 'monospace', fontSize: 14, color: '#333' },
  count: { fontSize: 14, color: '#333', marginBottom: 14, fontWeight: '500' },
  muted: { fontSize: 15, color: '#666', marginTop: 8 },
  errText: { fontSize: 15, color: '#b71c1c', marginBottom: 12 },
  centerBox: { paddingVertical: 32, alignItems: 'center', gap: 12 },
  cardList: { gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    elevation: 2,
  },
  cardHeaderAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: { fontSize: 13, color: '#6c6c6c', flex: 0.4 },
  cardValue: { fontSize: 14, color: '#1a1a1a', flex: 0.6, textAlign: 'right' },
  cardValueBold: { fontWeight: '600' },
  
  // Garis pemisah konsisten untuk semua rows
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 12,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  headerRow: {
    backgroundColor: '#1A237E',
    paddingVertical: 12,
  },
  headerText: { color: '#fff', fontWeight: 'bold' },
  cell: { fontSize: 13, color: '#333' },
  cellNo: { width: 32, textAlign: 'center' },
  cellNim: { width: 68 },
  cellNama: { flex: 1, minWidth: 72 },
  cellProdi: { width: 100 },
  cellKelas: { width: 150, textAlign: 'center' },
  cellActionWrapper: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  btnEdit: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnEditText: {
    fontSize: 12,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  btnDelete: {
    backgroundColor: '#ffebee',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnDeleteText: {
    fontSize: 12,
    color: '#b71c1c',
    fontWeight: '600',
  },

  btnRefresh: {
    alignSelf: 'flex-start',
    marginTop: 20,
    backgroundColor: '#1A237E',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  btnRefreshText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  btnPressed: {
    opacity: 0.85,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    marginBottom: 15,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnCancel: {
    backgroundColor: '#eee',
  },
  btnSave: {
    backgroundColor: '#1A237E',
  },
});