const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== 旧ESデータから新JSONフィールドへのデータ移行を開始します ===");

  // `type="es"` のSectionと、それに紐づくQuestionを全件取得する
  const sections = await prisma.section.findMany({
    where: { type: 'es' },
    include: { questions: { orderBy: { createdAt: 'asc' } } }
  });

  let migratedCount = 0;

  for (const section of sections) {
    if (section.questions.length === 0) continue; // 設問がない場合はスキップ

    const company = await prisma.company.findUnique({ where: { id: section.companyId } });
    if (!company) continue;

    // 既に新しいJSONフィールドにデータが入っているなら安全のため上書きしない
    if (company.questions && Array.isArray(company.questions) && company.questions.length > 0) {
      console.log(`[スキップ] Company ID: ${company.id} は既にJSONデータを持っています。`);
      continue; 
    }

    // 古いデータを新しいJSON形式にマッピング
    const jsonQuestions = section.questions.map(q => ({
      id: q.id, // IDは古いものをそのまま引き継ぐので安全
      question: q.title,
      answer: q.content || "",
      maxLength: q.maxLength || null
    }));

    // JSONフィールドへ保存
    await prisma.company.update({
      where: { id: company.id },
      data: { questions: jsonQuestions }
    });

    console.log(`[成功] 企業 "${company.name}" のデータを移行しました (${jsonQuestions.length}件の設問)`);
    migratedCount++;
  }

  console.log(`\n=== 移行完了: 計 ${migratedCount} 社のデータを移行しました ===`);
}

main()
  .catch(e => {
    console.error("エラーが発生しました:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
