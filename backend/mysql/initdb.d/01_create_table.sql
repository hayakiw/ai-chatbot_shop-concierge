CREATE TABLE chat_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chat_uid VARCHAR(64) NOT NULL UNIQUE COMMENT 'チャットユーザーUID(UUID)',
    gender ENUM('male', 'female', 'unknown') NULL COMMENT '性別',
    residence ENUM('in_prefecture', 'out_prefecture') NULL COMMENT '県内・県外',
    age INT UNSIGNED NULL COMMENT '年齢',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='チャット利用ユーザー';

CREATE TABLE chat_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chat_user_id BIGINT UNSIGNED NOT NULL COMMENT 'chat_users.id（論理参照）',
    session_id BIGINT UNSIGNED NULL COMMENT 'セッションID（任意）',
    role ENUM('user', 'assistant', 'system') NOT NULL COMMENT '発言者',
    message TEXT NOT NULL COMMENT '発言内容',
    menus_json TEXT NULL COMMENT 'メニューのjsonデータ',
    ip_address VARCHAR(32) NULL COMMENT 'IPv4 / IPv6',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_chat_user_created (chat_user_id, created_at),
    INDEX idx_ip_created (ip_address, created_at),
    INDEX idx_session_created (session_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='チャットメッセージログ';
