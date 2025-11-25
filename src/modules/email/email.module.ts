@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
