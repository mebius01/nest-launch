import { Injectable } from "@nestjs/common";
import { PubSubService } from "../redis/pubsub.service";
import { ENotificationChannels } from "./enum";
import { QueueService } from "../queue/queue.service";

@Injectable()
export class NotificationService {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly queueService: QueueService,

  ) {
    this.pubSubService.subscribe(
      ENotificationChannels.USER_REGISTRATION,
      this.handleNewUserRegistration.bind(this)
    );
  }

  private async handleNewUserRegistration(message: string) {
    const data = JSON.parse(message);
    //! Send notification to admin
    console.info(`New user registration`, { ...data });
    //! Send email to user
    await this.queueService.add('sendRegistration', { user:data })

  }
}
