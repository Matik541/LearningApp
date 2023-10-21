import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

// entities
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { LessonCompleted } from '../../lessons/entities/lessonCompleted.entity';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  // TODO: rename
  @ApiProperty()
  @Column()
  userName: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @Column()
  hashedPassword: string;

  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @ApiProperty({
    type: () => [Lesson],
    example: [
      {
        id: 0,
        title: 'string',
        description: 'string',
        iconPath: 'string',
      },
    ],
  })
  @OneToMany(() => Lesson, (lesson) => lesson.creator)
  createdLessons: Lesson[];

  @ApiProperty({
    type: () => [Comment],
    example: [
      {
        id: 0,
        comment: 'string',
      },
    ],
  })
  @OneToMany(() => Comment, (comment) => comment.creator)
  comments: Comment[];

  @ApiProperty({
    type: () => [LessonCompleted],
    example: [
      {
        id: 0,
        score: 0,
      },
    ],
  })
  @OneToMany(() => LessonCompleted, (lessonCompleted) => lessonCompleted.user)
  lessonsCompleted: LessonCompleted[];
}
