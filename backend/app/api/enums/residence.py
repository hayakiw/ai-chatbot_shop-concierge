from enum import Enum

class Residence(str, Enum):
    """居住地"""
    IN_PREFECTURE = "in_prefecture"
    OUT_PREFECTURE = "out_prefecture"
