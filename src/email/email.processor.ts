import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service';
import { JobName, QueueName } from '@/constants/job.constant';
import { Logger } from '@/helpers/loggerHelper';

@Processor(QueueName.EMAIL)
export class EmailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
    Logger.info('--- EmailProcessor đã được khởi tạo và đang lắng nghe queue ---');
  }

  async process(job: Job) {    
    if (job.name === JobName.EMAIL_VERIFICATION) {
      const { email, token } = job.data;
      await this.mailService.sendEmailVerification(email, token);
      Logger.info('Email verification job processed');
    }
  }
}
