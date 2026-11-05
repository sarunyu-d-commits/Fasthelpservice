import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ServiceCard } from "@/components/service-card";
import {
  AlertBox,
  EmptyState,
  LoadingView,
  PageHeader,
  Screen,
} from "@/components/ui";
import { fetchServices } from "@/lib/api";
import { useAsyncData } from "@/lib/use-async-data";
import { colors, font, radius, spacing } from "@/theme";

export default function ServicesScreen() {
  const { data: services, loading, error, reload } = useAsyncData(fetchServices);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>();

  const list = services ?? [];
  const categories = useMemo(
    () => Array.from(new Set(list.map((service) => service.category))),
    [list],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return list.filter((service) => {
      const matchesCategory = !category || service.category === category;
      const matchesQuery =
        !needle ||
        [service.name, service.description ?? "", service.category].some(
          (value) => value.toLowerCase().includes(needle),
        );
      return matchesCategory && matchesQuery;
    });
  }, [list, category, query]);

  if (loading && !services) return <LoadingView />;

  return (
    <Screen>
      <PageHeader
        title="บริการทั้งหมด"
        subtitle="เลือกบริการที่ต้องการ แล้วนัดหมายช่างได้ทันที"
      />

      {error ? (
        <AlertBox>
          {error}{" "}
          <Text style={styles.retry} onPress={() => void reload()}>
            ลองใหม่
          </Text>
        </AlertBox>
      ) : null}

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="ค้นหาบริการ เช่น ล้างแอร์ ซ่อมท่อ"
        placeholderTextColor={colors.slate400}
        style={styles.search}
        returnKeyType="search"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsScroll}
      >
        <Pressable
          onPress={() => setCategory(undefined)}
          style={[styles.chip, !category && styles.chipActive]}
        >
          <Text style={[styles.chipText, !category && styles.chipTextActive]}>
            ทั้งหมด
          </Text>
        </Pressable>
        {categories.map((item) => {
          const active = category === item;
          return (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={
            query.trim()
              ? `ไม่พบบริการที่ตรงกับ "${query.trim()}"`
              : "ไม่พบบริการในหมวดนี้"
          }
          description="ลองค้นหาด้วยคำอื่น เลือกหมวดอื่น หรือดูบริการทั้งหมด"
          action={
            query.trim() || category ? (
              <Text
                style={styles.reset}
                onPress={() => {
                  setQuery("");
                  setCategory(undefined);
                }}
              >
                ดูบริการทั้งหมด
              </Text>
            ) : undefined
          }
        />
      ) : (
        <View style={styles.list}>
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.slate900,
  },
  chipsScroll: {
    marginTop: spacing.md,
    marginHorizontal: -spacing.lg,
  },
  chips: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.teal600,
    borderColor: colors.teal600,
  },
  chipText: {
    fontSize: 13,
    fontWeight: font.medium,
    color: colors.slate600,
  },
  chipTextActive: {
    color: colors.white,
  },
  retry: {
    fontWeight: font.semibold,
    textDecorationLine: "underline",
  },
  reset: {
    fontSize: 14,
    fontWeight: font.semibold,
    color: colors.white,
    backgroundColor: colors.teal600,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    overflow: "hidden",
  },
  list: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
