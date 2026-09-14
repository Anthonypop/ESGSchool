CREATE TABLE `esgSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`schoolName` varchar(255) NOT NULL,
	`reportYear` varchar(32) NOT NULL,
	`profileData` json NOT NULL,
	`environmentData` json,
	`socialData` json,
	`governanceData` json,
	`status` enum('draft','submitted','reviewing','responded') NOT NULL DEFAULT 'draft',
	`submittedAt` timestamp,
	`reviewNote` text,
	`reportFileName` varchar(255),
	`reportFileUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `esgSubmissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `esg_submission_owner_year_unique` UNIQUE(`ownerId`,`reportYear`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
