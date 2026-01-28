from enum import Enum

class Gender(str, Enum):
    """性別"""
    MALE = "male"
    FEMALE = "female"
    UNKNOWN = "unknown"
