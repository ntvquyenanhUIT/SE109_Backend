import pool from "@/config/db";
import {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/models/comment";

export class CommentService {
  static async getCommentsByArticleId(articleId: string): Promise<Comment[]> {
    const queryText = `
            SELECT 
                c.*,
                u.username as author_name,
                u.profile_picture_url as author_profile_picture_url
            FROM comments c
            LEFT JOIN users u ON c.author_id = u.id
            WHERE c.article_id = $1 AND c.deleted_at IS NULL
            ORDER BY c.created_at DESC
        `;

    const result = await pool.query(queryText, [articleId]);
    return result.rows;
  }

  static async createComment(
    commentData: CreateCommentRequest,
    authorId: string
  ): Promise<Comment> {
    if (this.containsInappropriateContent(commentData.content)) {
      throw new Error("Comment contains inappropriate content");
    }

    const queryText = `
            INSERT INTO comments (article_id, author_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

    const values = [commentData.article_id, authorId, commentData.content];

    const result = await pool.query(queryText, values);
    const comment = result.rows[0];
    const userQuery = `SELECT username, profile_picture_url FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [authorId]);

    return {
      ...comment,
      author_name: userResult.rows[0]?.username,
      author_profile_picture_url: userResult.rows[0]?.profile_picture_url,
    };
  }

  static async updateComment(
    id: string,
    authorId: string,
    isAdmin: boolean,
    updateData: UpdateCommentRequest
  ): Promise<Comment | null> {
    if (this.containsInappropriateContent(updateData.content)) {
      throw new Error("Comment contains inappropriate content");
    }

    const checkQuery = `
            SELECT * FROM comments 
            WHERE id = $1 AND deleted_at IS NULL
            ${!isAdmin ? "AND author_id = $2" : ""}
        `;

    const checkValues = isAdmin ? [id] : [id, authorId];
    const checkResult = await pool.query(checkQuery, checkValues);

    if (checkResult.rows.length === 0) {
      return null;
    }

    const updateQuery = `
            UPDATE comments
            SET content = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
    const result = await pool.query(updateQuery, [updateData.content, id]);

    const comment = result.rows[0];
    const userQuery = `SELECT username, profile_picture_url FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [comment.author_id]);

    return {
      ...comment,
      author_name: userResult.rows[0]?.username,
      author_profile_picture_url: userResult.rows[0]?.profile_picture_url,
    };
  }

  static async deleteComment(
    id: string,
    authorId: string,
    isAdmin: boolean
  ): Promise<boolean> {
    // Check if comment exists and belongs to the user (or if user is admin)
    const checkQuery = `
            SELECT * FROM comments 
            WHERE id = $1 AND deleted_at IS NULL
            ${!isAdmin ? "AND author_id = $2" : ""}
        `;

    const checkValues = isAdmin ? [id] : [id, authorId];
    const checkResult = await pool.query(checkQuery, checkValues);

    if (checkResult.rows.length === 0) {
      return false;
    }

    // Soft delete the comment
    const deleteQuery = `
            UPDATE comments 
            SET deleted_at = CURRENT_TIMESTAMP 
            WHERE id = $1
            RETURNING id
        `;
    const result = await pool.query(deleteQuery, [id]);

    return (result.rowCount ?? 0) > 0;
  }

  static async likeComment(id: string): Promise<Comment | null> {
    const query = `
            UPDATE comments
            SET likes = likes + 1
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING *
        `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }
    const comment = result.rows[0];
    const userQuery = `SELECT username, profile_picture_url FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [comment.author_id]);

    return {
      ...comment,
      author_name: userResult.rows[0]?.username,
      author_profile_picture_url: userResult.rows[0]?.profile_picture_url,
    };
  }

  private static containsInappropriateContent(content: string): boolean {
    const inappropriateWords = ["fuck", "shit", "bitch", "asshole", "cunt"];

    const normalizedContent = content.toLowerCase();
    return inappropriateWords.some((word) => normalizedContent.includes(word));
  }
}
