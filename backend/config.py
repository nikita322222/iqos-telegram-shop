from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./iqos_shop.db"
    bot_token: str
    secret_key: str = "change-me-in-production"
    cors_origins: str = "http://localhost:5173,http://localhost:5174,https://iqos-shop.vercel.app,https://admin-frontend-phi-seven.vercel.app"
    
    # Imgur settings (опционально)
    imgur_client_id: str = ""
    
    class Config:
        env_file = ".env"
    
    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
