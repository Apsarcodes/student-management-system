package com.sms.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class StudentContactUpdateDto {

    @Pattern(regexp = "^$|^[0-9+()\\s-]{7,20}$", message = "Please provide a valid phone number")
    private String phone;

    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;

    public StudentContactUpdateDto() {}

    public StudentContactUpdateDto(String phone, String address) {
        this.phone = phone;
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
