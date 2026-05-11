-- CreateTable
CREATE TABLE "ResultadoQuiz" (
    "id" SERIAL NOT NULL,
    "estudianteId" INTEGER NOT NULL,
    "quizId" INTEGER NOT NULL,
    "calificacion" DOUBLE PRECISION NOT NULL,
    "correctas" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "respuestas" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultadoQuiz_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ResultadoQuiz" ADD CONSTRAINT "ResultadoQuiz_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoQuiz" ADD CONSTRAINT "ResultadoQuiz_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
